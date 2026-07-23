/**
 * Presence persistence: Netlify Blobs in production, in-memory fallback for local dev.
 */

import { getStore } from '@netlify/blobs'
import type { PresenceSnapshot } from './presence'

const STORE_NAME = 'presence'
const STORE_KEY = 'current'

/** Local-dev fallback (single Node process). */
let memory: PresenceSnapshot | null = null

function canUseBlobs() {
  // Netlify provides site context in production / `netlify dev`.
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.NETLIFY_DEV,
  )
}

export async function readPresence(): Promise<PresenceSnapshot | null> {
  if (canUseBlobs()) {
    try {
      const store = getStore(STORE_NAME)
      const data = (await store.get(STORE_KEY, { type: 'json' })) as
        | PresenceSnapshot
        | null
      if (data) return data
    } catch (err) {
      console.warn('[presence] Blobs read failed, using memory', err)
    }
  }
  return memory
}

export async function writePresence(snapshot: PresenceSnapshot): Promise<void> {
  memory = snapshot
  if (!canUseBlobs()) return

  try {
    const store = getStore(STORE_NAME)
    await store.setJSON(STORE_KEY, snapshot)
  } catch (err) {
    console.warn('[presence] Blobs write failed; kept in memory only', err)
  }
}
