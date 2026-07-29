/**
 * Resolve rich preview data for a URL (X / GitHub / Bilibili / YouTube / OG).
 * Used by GET /api/link-card
 */

import {
  detectProvider,
  faviconFor,
  normalizeUrl,
  parseBilibiliId,
  parseGithubPath,
  parseXStatusId,
  parseYoutubeId,
  providerLabel,
  type LinkCardData,
  type LinkProvider,
} from '@/lib/link-card'

const UA = 'priority.me-link-card/1.0 (+https://razet.me)'

function baseCard(url: URL, provider: LinkProvider, partial: Partial<LinkCardData>): LinkCardData {
  return {
    url: url.toString(),
    provider,
    title: partial.title || url.hostname,
    description: partial.description ?? null,
    image: partial.image ?? null,
    siteName: partial.siteName || providerLabel(provider),
    favicon: partial.favicon ?? faviconFor(url),
    author: partial.author ?? null,
  }
}

async function fetchX(url: URL): Promise<LinkCardData | null> {
  const id = parseXStatusId(url)
  if (!id) {
    return baseCard(url, 'x', {
      title: url.pathname.slice(1) || 'X',
      siteName: 'X',
    })
  }
  try {
    const res = await fetch(`https://api.fxtwitter.com/status/${id}`, {
      headers: { Accept: 'application/json', 'User-Agent': UA },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as {
      tweet?: {
        text?: string
        author?: { name?: string; screen_name?: string; avatar_url?: string }
        media?: { photos?: { url?: string }[]; videos?: { thumbnail_url?: string }[] }
        replying_to_status?: unknown
      }
    }
    const tw = data.tweet
    if (!tw) throw new Error('no tweet')
    const image =
      tw.media?.photos?.[0]?.url ||
      tw.media?.videos?.[0]?.thumbnail_url ||
      tw.author?.avatar_url ||
      null
    const handle = tw.author?.screen_name ? `@${tw.author.screen_name}` : null
    return baseCard(url, 'x', {
      title: tw.author?.name || handle || 'Post on X',
      description: tw.text || null,
      image,
      author: handle,
      siteName: 'X',
    })
  } catch {
    return baseCard(url, 'x', {
      title: `Post ${id}`,
      siteName: 'X',
    })
  }
}

async function fetchGithub(url: URL): Promise<LinkCardData> {
  const parsed = parseGithubPath(url)
  if (!parsed?.repo) {
    return baseCard(url, 'github', {
      title: parsed?.owner || 'GitHub',
      siteName: 'GitHub',
    })
  }
  const { owner, repo, type, number } = parsed
  try {
    if (type === 'issue' || type === 'pull') {
      const kind = type === 'pull' ? 'pulls' : 'issues'
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/${kind}/${number}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': UA,
            'X-GitHub-Api-Version': '2022-11-28',
          },
          signal: AbortSignal.timeout(6000),
        },
      )
      if (res.ok) {
        const j = (await res.json()) as {
          title?: string
          body?: string
          user?: { login?: string; avatar_url?: string }
          state?: string
        }
        return baseCard(url, 'github', {
          title: j.title || `${owner}/${repo}#${number}`,
          description: (j.body || '').slice(0, 180) || `${type} · ${j.state || ''}`,
          image: j.user?.avatar_url || null,
          author: j.user?.login ? `@${j.user.login}` : null,
          siteName: 'GitHub',
        })
      }
    }
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': UA,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const j = (await res.json()) as {
        full_name?: string
        description?: string
        owner?: { avatar_url?: string }
        stargazers_count?: number
        language?: string
      }
      const bits = [
        j.description,
        j.language,
        typeof j.stargazers_count === 'number' ? `★ ${j.stargazers_count}` : null,
      ].filter(Boolean)
      return baseCard(url, 'github', {
        title: j.full_name || `${owner}/${repo}`,
        description: bits.join(' · ') || null,
        image: j.owner?.avatar_url || null,
        siteName: 'GitHub',
      })
    }
  } catch {
    /* fall through */
  }
  return baseCard(url, 'github', {
    title: `${owner}/${repo}`,
    siteName: 'GitHub',
  })
}

async function fetchYoutube(url: URL): Promise<LinkCardData> {
  const id = parseYoutubeId(url)
  try {
    const oembed = new URL('https://www.youtube.com/oembed')
    oembed.searchParams.set('url', url.toString())
    oembed.searchParams.set('format', 'json')
    const res = await fetch(oembed, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const j = (await res.json()) as {
        title?: string
        author_name?: string
        thumbnail_url?: string
      }
      return baseCard(url, 'youtube', {
        title: j.title || 'YouTube',
        description: j.author_name || null,
        image: j.thumbnail_url || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null),
        author: j.author_name || null,
        siteName: 'YouTube',
      })
    }
  } catch {
    /* fall through */
  }
  return baseCard(url, 'youtube', {
    title: id || 'YouTube',
    image: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null,
    siteName: 'YouTube',
  })
}

async function fetchBilibili(url: URL): Promise<LinkCardData> {
  const id = parseBilibiliId(url)
  // Use bilibili iframe player page OG via generic fetch when possible
  const card = await fetchOpenGraph(url, 'bilibili')
  if (card.title && card.title !== url.hostname) return card
  return baseCard(url, 'bilibili', {
    title: id || '哔哩哔哩',
    siteName: '哔哩哔哩',
  })
}

async function fetchOpenGraph(url: URL, provider: LinkProvider = 'generic'): Promise<LinkCardData> {
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(7000),
    })
    if (!res.ok) throw new Error(String(res.status))
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
      throw new Error('not html')
    }
    const html = (await res.text()).slice(0, 200_000)
    const meta = (property: string) => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
        'i',
      )
      const re2 = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
        'i',
      )
      return html.match(re)?.[1] || html.match(re2)?.[1] || null
    }
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
    const title =
      decode(meta('og:title') || meta('twitter:title') || titleTag || url.hostname) ||
      url.hostname
    const description = decode(
      meta('og:description') || meta('description') || meta('twitter:description'),
    )
    let image: string | null = meta('og:image') || meta('twitter:image')
    if (image) {
      try {
        image = new URL(image, url).toString()
      } catch {
        /* keep */
      }
    }
    const siteName = decode(meta('og:site_name')) || providerLabel(provider)
    return baseCard(url, provider, {
      title,
      description,
      image,
      siteName,
    })
  } catch {
    return baseCard(url, provider, {
      title: url.hostname + url.pathname,
      siteName: providerLabel(provider),
    })
  }
}

function decode(s: string | null | undefined): string | null {
  if (!s) return null
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

export async function resolveLinkCard(rawUrl: string): Promise<LinkCardData | null> {
  const url = normalizeUrl(rawUrl)
  if (!url) return null
  const provider = detectProvider(url)
  switch (provider) {
    case 'x':
      return fetchX(url)
    case 'github':
      return fetchGithub(url)
    case 'youtube':
      return fetchYoutube(url)
    case 'bilibili':
      return fetchBilibili(url)
    case 'npm':
      return fetchOpenGraph(url, 'npm')
    default:
      return fetchOpenGraph(url, 'generic')
  }
}
