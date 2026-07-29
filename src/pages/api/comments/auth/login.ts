/**
 * Start GitHub OAuth for blog comments.
 * GET /api/comments/auth/login?returnTo=/posts/slug
 */
export const prerender = false

import type { APIRoute } from 'astro'
import {
  safeReturnTo,
  signOAuthState,
} from '@/lib/comments-auth'
import { commentsConfigured } from '@/lib/comments'

function siteOrigin(request: Request): string {
  const env = process.env.URL || process.env.DEPLOY_PRIME_URL
  if (env) return env.replace(/\/$/, '')
  return new URL(request.url).origin
}

export const GET: APIRoute = async ({ request }) => {
  if (!commentsConfigured()) {
    return new Response('Comments OAuth is not configured', { status: 503 })
  }

  const url = new URL(request.url)
  const returnTo = safeReturnTo(url.searchParams.get('returnTo'), '/')
  const clientId = process.env.COMMENTS_GITHUB_CLIENT_ID!.trim()
  const origin = siteOrigin(request)
  const redirectUri = `${origin}/api/comments/auth/callback`

  let state: string
  try {
    state = signOAuthState(returnTo)
  } catch {
    return new Response('Session secret missing', { status: 503 })
  }

  const auth = new URL('https://github.com/login/oauth/authorize')
  auth.searchParams.set('client_id', clientId)
  auth.searchParams.set('redirect_uri', redirectUri)
  // GitHub Apps ignore classic scopes (permissions come from the App).
  // OAuth Apps still benefit from a minimal identity scope.
  auth.searchParams.set('scope', 'read:user')
  auth.searchParams.set('state', state)
  // Hint for GitHub App user-to-server (harmless for OAuth Apps).
  auth.searchParams.set('allow_signup', 'true')

  return Response.redirect(auth.toString(), 302)
}
