/**
 * POST /api/comments/auth/logout — clear comment session cookie
 * GET  also accepted for simple <a href> logout
 */
export const prerender = false

import type { APIRoute } from 'astro'
import { clearSessionCookieHeader, safeReturnTo } from '@/lib/comments-auth'

function siteOrigin(request: Request): string {
  const env = process.env.URL || process.env.DEPLOY_PRIME_URL
  if (env) return env.replace(/\/$/, '')
  return new URL(request.url).origin
}

function handle(request: Request) {
  const url = new URL(request.url)
  const returnTo = safeReturnTo(url.searchParams.get('returnTo'), '/')
  const origin = siteOrigin(request)
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${origin}${returnTo}`,
      'Set-Cookie': clearSessionCookieHeader(),
    },
  })
}

export const GET: APIRoute = async ({ request }) => handle(request)
export const POST: APIRoute = async ({ request }) => handle(request)
