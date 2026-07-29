/**
 * Signed session cookie helpers for blog comment OAuth.
 */

import { createHmac, timingSafeEqual } from 'crypto'
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
  type CommentAuthor,
} from '@/lib/comments'

export type CommentSession = CommentAuthor & {
  /** unix seconds */
  exp: number
}

function sessionSecret(): string {
  const s = process.env.COMMENTS_SESSION_SECRET?.trim()
  if (!s) throw new Error('COMMENTS_SESSION_SECRET is not configured')
  return s
}

function b64url(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
  return b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64')
}

export function signSession(author: CommentAuthor, maxAgeSec = SESSION_MAX_AGE_SEC): string {
  const payload: CommentSession = {
    ...author,
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  }
  const body = b64url(JSON.stringify(payload))
  const sig = b64url(
    createHmac('sha256', sessionSecret()).update(body).digest(),
  )
  return `${body}.${sig}`
}

export function verifySession(token: string | null | undefined): CommentSession | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  if (!body || !sig) return null

  let secret: string
  try {
    secret = sessionSecret()
  } catch {
    return null
  }

  const expected = b64url(createHmac('sha256', secret).update(body).digest())
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const data = JSON.parse(fromB64url(body).toString('utf8')) as CommentSession
    if (
      typeof data.id !== 'number' ||
      typeof data.login !== 'string' ||
      typeof data.avatarUrl !== 'string' ||
      typeof data.htmlUrl !== 'string' ||
      typeof data.exp !== 'number'
    ) {
      return null
    }
    if (data.exp < Math.floor(Date.now() / 1000)) return null
    return {
      id: data.id,
      login: data.login,
      name: typeof data.name === 'string' ? data.name : null,
      avatarUrl: data.avatarUrl,
      htmlUrl: data.htmlUrl,
      exp: data.exp,
    }
  } catch {
    return null
  }
}

export function parseCookies(raw: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!raw) return out
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const val = part.slice(idx + 1).trim()
    if (!key) continue
    try {
      out[key] = decodeURIComponent(val)
    } catch {
      out[key] = val
    }
  }
  return out
}

export function getSessionFromRequest(request: Request): CommentSession | null {
  const cookies = parseCookies(request.headers.get('cookie'))
  return verifySession(cookies[SESSION_COOKIE])
}

export function sessionCookieHeader(
  value: string,
  maxAge = SESSION_MAX_AGE_SEC,
): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true') {
    parts.push('Secure')
  }
  return parts.join('; ')
}

export function clearSessionCookieHeader(): string {
  const parts = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true') {
    parts.push('Secure')
  }
  return parts.join('; ')
}

/** CSRF-ish state for OAuth round-trip. */
export function signOAuthState(returnTo: string): string {
  const body = b64url(JSON.stringify({ r: returnTo, t: Date.now() }))
  const sig = b64url(
    createHmac('sha256', sessionSecret()).update(`oauth:${body}`).digest(),
  )
  return `${body}.${sig}`
}

export function verifyOAuthState(state: string | null): string | null {
  if (!state) return null
  const parts = state.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  if (!body || !sig) return null

  let secret: string
  try {
    secret = sessionSecret()
  } catch {
    return null
  }

  const expected = b64url(
    createHmac('sha256', secret).update(`oauth:${body}`).digest(),
  )
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const data = JSON.parse(fromB64url(body).toString('utf8')) as {
      r?: string
      t?: number
    }
    if (typeof data.r !== 'string' || typeof data.t !== 'number') return null
    // 15 min window
    if (Date.now() - data.t > 15 * 60 * 1000) return null
    return data.r
  } catch {
    return null
  }
}

/** Only allow same-origin relative return paths. */
export function safeReturnTo(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback
  if (raw.includes('\\') || raw.includes('\n') || raw.includes('\r')) return fallback
  return raw.slice(0, 500)
}
