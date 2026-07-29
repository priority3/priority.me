/**
 * GitHub OAuth callback for blog comments.
 * GET /api/comments/auth/callback?code=&state=
 */
export const prerender = false

import type { APIRoute } from 'astro'
import {
  sessionCookieHeader,
  signSession,
  verifyOAuthState,
} from '@/lib/comments-auth'
import { commentsConfigured, type CommentAuthor } from '@/lib/comments'

function siteOrigin(request: Request): string {
  const env = process.env.URL || process.env.DEPLOY_PRIME_URL
  if (env) return env.replace(/\/$/, '')
  return new URL(request.url).origin
}

function redirect(location: string, setCookie?: string) {
  const headers = new Headers({ Location: location })
  if (setCookie) headers.append('Set-Cookie', setCookie)
  return new Response(null, { status: 302, headers })
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const origin = siteOrigin(request)

  if (!commentsConfigured()) {
    return redirect(`${origin}/?comments_error=not_configured`)
  }

  const err = url.searchParams.get('error')
  if (err) {
    return redirect(`${origin}/?comments_error=${encodeURIComponent(err)}`)
  }

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const returnTo = verifyOAuthState(state) || '/'

  if (!code) {
    return redirect(
      `${origin}${returnTo}${returnTo.includes('?') ? '&' : '?'}comments_error=missing_code`,
    )
  }

  const clientId = process.env.COMMENTS_GITHUB_CLIENT_ID!.trim()
  const clientSecret = process.env.COMMENTS_GITHUB_CLIENT_SECRET!.trim()
  const redirectUri = `${origin}/api/comments/auth/callback`

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string
      error?: string
      error_description?: string
    }
    if (!tokenJson.access_token) {
      console.warn('[comments] oauth token error', tokenJson)
      return redirect(
        `${origin}${returnTo}${returnTo.includes('?') ? '&' : '?'}comments_error=token`,
      )
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${tokenJson.access_token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'priority.me-comments',
      },
    })
    if (!userRes.ok) {
      return redirect(
        `${origin}${returnTo}${returnTo.includes('?') ? '&' : '?'}comments_error=user`,
      )
    }
    const user = (await userRes.json()) as {
      id: number
      login: string
      name: string | null
      avatar_url: string
      html_url: string
    }

    const author: CommentAuthor = {
      id: user.id,
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url,
    }

    const session = signSession(author)
    // Drop oauth token — we only keep identity in the signed cookie.
    return redirect(`${origin}${returnTo}`, sessionCookieHeader(session))
  } catch (e) {
    console.error('[comments] oauth callback failed', e)
    return redirect(
      `${origin}${returnTo}${returnTo.includes('?') ? '&' : '?'}comments_error=server`,
    )
  }
}
