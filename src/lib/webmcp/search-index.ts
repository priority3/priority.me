/**
 * Client-side loading and keyword search over the build-time post index.
 *
 * The index is fetched lazily — only when a content tool actually runs — so ordinary
 * visitors never pay for it.
 */

export interface IndexedPost {
  collection: 'blogs' | 'leetcode'
  slug: string
  /** Site-relative path, e.g. `/posts/vue3-contribution`. */
  href: string
  title: string
  desc?: string
  tag?: string
  /** ISO 8601. */
  date: string
  /** Plain-text body, used for matching and snippets. */
  text: string
}

export interface SearchIndex {
  version: 1
  posts: IndexedPost[]
}

export interface SearchHit {
  title: string
  href: string
  collection: 'blogs' | 'leetcode'
  date: string
  tag?: string
  desc?: string
  snippet: string
  score: number
}

export const SEARCH_INDEX_PATH = '/search-index.json'

let cache: Promise<SearchIndex> | null = null

export function loadIndex(): Promise<SearchIndex> {
  // Reason: one in-flight promise per page load. On failure the cache is cleared so a
  // later tool call can retry instead of replaying a rejected promise forever.
  if (!cache) {
    cache = fetch(SEARCH_INDEX_PATH, { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) throw new Error(`search index request failed: ${res.status}`)
        return res.json() as Promise<SearchIndex>
      })
      .catch((error) => {
        cache = null
        throw error
      })
  }
  return cache
}

/** Field weights. Title matches dominate; body matches only break ties. */
const WEIGHTS = { title: 8, desc: 4, tag: 3, text: 1 } as const

/** Reason: caps body hits so a long article cannot outrank a precise title match. */
const TEXT_HIT_CAP = 10

export function toTerms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean)
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0
  let count = 0
  let from = 0
  for (;;) {
    const at = haystack.indexOf(needle, from)
    if (at === -1) break
    count += 1
    from = at + needle.length
  }
  return count
}

function scorePost(post: IndexedPost, terms: string[]): number {
  const title = post.title.toLowerCase()
  const desc = (post.desc ?? '').toLowerCase()
  const tag = (post.tag ?? '').toLowerCase()
  const text = post.text.toLowerCase()

  let score = 0
  for (const term of terms) {
    score += WEIGHTS.title * countOccurrences(title, term)
    score += WEIGHTS.desc * countOccurrences(desc, term)
    score += WEIGHTS.tag * countOccurrences(tag, term)
    score += WEIGHTS.text * Math.min(countOccurrences(text, term), TEXT_HIT_CAP)
  }
  return score
}

/** Text around the earliest matching term, so the agent can judge relevance without opening the post. */
export function buildSnippet(text: string, terms: string[], radius = 60): string {
  const lower = text.toLowerCase()
  let at = -1
  for (const term of terms) {
    const found = lower.indexOf(term)
    if (found !== -1 && (at === -1 || found < at)) at = found
  }
  if (at === -1) {
    const head = text.slice(0, radius * 2).trim()
    return text.length > radius * 2 ? `${head}…` : head
  }
  const start = Math.max(0, at - radius)
  const end = Math.min(text.length, at + radius)
  const lead = start > 0 ? '…' : ''
  const tail = end < text.length ? '…' : ''
  return `${lead}${text.slice(start, end).trim()}${tail}`
}

export interface SearchOptions {
  collection?: 'blogs' | 'leetcode' | 'all'
  limit?: number
}

export async function searchPosts(
  query: string,
  { collection = 'all', limit = 5 }: SearchOptions = {},
): Promise<SearchHit[]> {
  const terms = toTerms(query)
  if (!terms.length) return []

  const { posts } = await loadIndex()
  const pool = collection === 'all' ? posts : posts.filter(p => p.collection === collection)

  return pool
    .map(post => ({ post, score: scorePost(post, terms) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) =>
      // Same relevance → newer first.
      b.score - a.score || Date.parse(b.post.date) - Date.parse(a.post.date))
    .slice(0, limit)
    .map(({ post, score }) => ({
      title: post.title,
      href: post.href,
      collection: post.collection,
      date: post.date,
      tag: post.tag,
      desc: post.desc,
      snippet: buildSnippet(post.text, terms),
      score,
    }))
}

/** Resolves `/posts/x`, `posts/x`, `x`, or a full same-origin URL to an indexed post. */
export async function findPost(input: string): Promise<IndexedPost | undefined> {
  const { posts } = await loadIndex()
  const raw = input.trim()
  if (!raw) return undefined

  let pathname = raw
  try {
    // Absolute URLs are tolerated here (read-only lookup); navigation validates separately.
    if (/^https?:\/\//i.test(raw)) pathname = new URL(raw).pathname
  } catch {
    // Fall through to slug matching.
  }

  const normalized = `/${pathname.replace(/^\/+|\/+$/g, '')}`
  const byHref = posts.find(post => post.href === normalized)
  if (byHref) return byHref

  const slug = normalized.split('/').pop()?.toLowerCase() ?? ''
  return posts.find(post => post.slug.toLowerCase() === slug)
}
