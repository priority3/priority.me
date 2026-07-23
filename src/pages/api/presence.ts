/**
 * ProcessReporter webhook + public Presence read.
 *
 * POST — ProcessReporter MixSpace destination (requires PRESENCE_TOKEN as body.key)
 * GET  — sanitized current presence for the site UI
 */
export const prerender = false

import type { APIRoute } from 'astro'
import {
  sanitizeIncoming,
  toPublic,
  type PresencePostBody,
} from '@/lib/presence'
import { readPresence, writePresence } from '@/lib/presence-store'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })

export const GET: APIRoute = async () => {
  const snapshot = await readPresence()
  return json(toPublic(snapshot))
}

export const POST: APIRoute = async ({ request }) => {
  const token = process.env.PRESENCE_TOKEN?.trim()
  if (!token) {
    return json({ error: 'PRESENCE_TOKEN is not configured' }, 503)
  }

  let body: PresencePostBody
  try {
    body = (await request.json()) as PresencePostBody
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  if (body.key !== token) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const snapshot = sanitizeIncoming(body)
  await writePresence(snapshot)

  return json({
    ok: 1,
    processName: snapshot.process?.name ?? null,
    timestamp: snapshot.timestamp,
  })
}

export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, OPTIONS',
    },
  })
