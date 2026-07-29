/**
 * Third-party link card helpers — detect providers + shape card data.
 */

export type LinkProvider =
  | 'x'
  | 'github'
  | 'bilibili'
  | 'youtube'
  | 'npm'
  | 'generic'

export type LinkCardData = {
  url: string
  provider: LinkProvider
  title: string
  description?: string | null
  image?: string | null
  siteName: string
  favicon?: string | null
  author?: string | null
}

const X_HOSTS = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com'])
const GH_HOSTS = new Set(['github.com', 'www.github.com'])
const BILI_HOSTS = new Set(['www.bilibili.com', 'bilibili.com', 'm.bilibili.com', 'b23.tv'])
const YT_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'])
const NPM_HOSTS = new Set(['www.npmjs.com', 'npmjs.com'])

export function normalizeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u
  } catch {
    return null
  }
}

export function detectProvider(url: URL): LinkProvider {
  const host = url.hostname.toLowerCase()
  if (X_HOSTS.has(host)) return 'x'
  if (GH_HOSTS.has(host)) return 'github'
  if (BILI_HOSTS.has(host)) return 'bilibili'
  if (YT_HOSTS.has(host)) return 'youtube'
  if (NPM_HOSTS.has(host)) return 'npm'
  return 'generic'
}

/** Status id from x.com/i/status/123 or /user/status/123 */
export function parseXStatusId(url: URL): string | null {
  const m = url.pathname.match(/\/(?:i\/)?status(?:es)?\/(\d+)/)
  return m?.[1] ?? null
}

export function parseGithubPath(url: URL): {
  owner: string
  repo?: string
  type?: 'repo' | 'issue' | 'pull' | 'other'
  number?: string
} | null {
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 1) return null
  const owner = parts[0]!
  if (parts.length === 1) return { owner, type: 'other' }
  const repo = parts[1]!
  if (parts[2] === 'issues' && parts[3]) {
    return { owner, repo, type: 'issue', number: parts[3] }
  }
  if (parts[2] === 'pull' && parts[3]) {
    return { owner, repo, type: 'pull', number: parts[3] }
  }
  if (parts.length >= 2) return { owner, repo, type: 'repo' }
  return { owner, type: 'other' }
}

export function parseBilibiliId(url: URL): string | null {
  const m = url.pathname.match(/\/video\/(BV[\w]+)/i)
  if (m) return m[1]!
  // b23.tv short links — id is path
  if (url.hostname.includes('b23.tv')) {
    const id = url.pathname.replace(/^\//, '')
    return id || null
  }
  return null
}

export function parseYoutubeId(url: URL): string | null {
  if (url.hostname.includes('youtu.be')) {
    return url.pathname.replace(/^\//, '').split('/')[0] || null
  }
  return url.searchParams.get('v')
}

export function providerLabel(p: LinkProvider): string {
  switch (p) {
    case 'x':
      return 'X'
    case 'github':
      return 'GitHub'
    case 'bilibili':
      return '哔哩哔哩'
    case 'youtube':
      return 'YouTube'
    case 'npm':
      return 'npm'
    default:
      return 'Link'
  }
}

export function faviconFor(url: URL): string {
  // Google s2 favicons — fine for public sites; no API key
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=64`
}

/** Whether a bare URL in its own paragraph should become a card. */
export function shouldCardifyHref(href: string, text: string): boolean {
  const u = normalizeUrl(href)
  if (!u) return false
  const t = text.trim()
  // Autolink or label ≈ url
  if (!t || t === href || t === href.replace(/^https?:\/\//, '')) return true
  try {
    if (t === u.hostname + u.pathname + u.search) return true
  } catch {
    /* ignore */
  }
  return t === href || t.replace(/\/$/, '') === href.replace(/\/$/, '')
}
