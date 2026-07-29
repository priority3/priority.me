/**
 * GET /api/link-card?url=https://...
 * Public link preview for prose link cards.
 */
export const prerender = false

import type { APIRoute } from 'astro'
import { normalizeUrl } from '@/lib/link-card'
import { resolveLinkCard } from '@/lib/link-card-resolve'

const json = (data: unknown, status = 200, cache = 'public, s-maxage=3600, stale-while-revalidate=86400') =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cache,
    },
  })

export const GET: APIRoute = async ({ request }) => {
  const raw = new URL(request.url).searchParams.get('url')
  if (!raw) return json({ error: 'Missing url' }, 400, 'no-store')
  if (!normalizeUrl(raw)) return json({ error: 'Invalid url' }, 400, 'no-store')

  try {
    const card = await resolveLinkCard(raw)
    if (!card) return json({ error: 'Unsupported url' }, 400, 'no-store')
    return json({ card })
  } catch (err) {
    console.error('[link-card]', err)
    return json({ error: 'Failed to resolve' }, 502, 'no-store')
  }
}
