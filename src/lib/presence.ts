/**
 * ProcessReporter → site Presence contract.
 * Compatible with MixSpace-style POST payload from ProcessReporter.
 */

export interface PresenceProcess {
  name?: string | null
  description?: string | null
  iconUrl?: string | null
  iconBase64?: string | null
}

export interface PresenceMedia {
  title?: string | null
  artist?: string | null
  duration?: number | null
  elapsedTime?: number | null
  processName?: string | null
}

/** Stored snapshot (server-side only; no token). */
export interface PresenceSnapshot {
  process: PresenceProcess | null
  media: PresenceMedia | null
  /** Unix seconds from ProcessReporter, or server receipt time. */
  timestamp: number
  /** Server receipt time (ms) for TTL. */
  receivedAt: number
}

/** Public GET body for the site UI. */
export interface PresencePublic {
  online: boolean
  processName: string | null
  processInfo: PresenceProcess | null
  mediaInfo: PresenceMedia | null
  timestamp: number | null
}

/** MixSpace / ProcessReporter POST body. */
export interface PresencePostBody {
  key?: string
  timestamp?: number
  process?: PresenceProcess | null
  media?: PresenceMedia | null
}

/** Consider offline when no refresh within this window. */
export const PRESENCE_TTL_MS = 5 * 60 * 1000

export function toPublic(snapshot: PresenceSnapshot | null): PresencePublic {
  if (!snapshot) {
    return {
      online: false,
      processName: null,
      processInfo: null,
      mediaInfo: null,
      timestamp: null,
    }
  }

  const age = Date.now() - snapshot.receivedAt
  const online = age >= 0 && age <= PRESENCE_TTL_MS
  const processName = snapshot.process?.name?.trim() || null

  return {
    online: online && Boolean(processName || snapshot.media?.title),
    processName: online ? processName : null,
    processInfo: online ? snapshot.process : null,
    mediaInfo: online ? snapshot.media : null,
    timestamp: online ? snapshot.timestamp : null,
  }
}

export function sanitizeIncoming(body: PresencePostBody): PresenceSnapshot {
  const process = body.process
    ? {
        name: cleanStr(body.process.name),
        // Window titles can leak private content — never persist publicly.
        description: null,
        iconUrl: cleanUrl(body.process.iconUrl),
        iconBase64: null,
      }
    : null

  const media = body.media
    ? {
        title: cleanStr(body.media.title),
        artist: cleanStr(body.media.artist),
        duration: cleanNum(body.media.duration),
        elapsedTime: cleanNum(body.media.elapsedTime),
        processName: cleanStr(body.media.processName),
      }
    : null

  const ts =
    typeof body.timestamp === 'number' && Number.isFinite(body.timestamp)
      ? Math.floor(body.timestamp)
      : Math.floor(Date.now() / 1000)

  return {
    process,
    media,
    timestamp: ts,
    receivedAt: Date.now(),
  }
}

function cleanStr(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const s = value.trim().slice(0, 120)
  return s.length ? s : null
}

function cleanNum(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value
}

function cleanUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const s = value.trim()
  if (!s.startsWith('https://') && !s.startsWith('http://')) return null
  return s.slice(0, 500)
}
