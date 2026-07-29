/**
 * GET /api/comments/me — current comment session (if any)
 */
export const prerender = false

import type { APIRoute } from 'astro'
import { commentsConfigured } from '@/lib/comments'
import { getSessionFromRequest } from '@/lib/comments-auth'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })

export const GET: APIRoute = async ({ request }) => {
  if (!commentsConfigured()) {
    return json({ configured: false, user: null })
  }
  const session = getSessionFromRequest(request)
  if (!session) return json({ configured: true, user: null })
  return json({
    configured: true,
    user: {
      id: session.id,
      login: session.login,
      name: session.name,
      avatarUrl: session.avatarUrl,
      htmlUrl: session.htmlUrl,
    },
  })
}
