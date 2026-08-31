/**
 * Current-page facts inferred from the DOM and URL.
 *
 * Reason: nothing is injected into the page for WebMCP's benefit. Everything here is
 * read from markup the site already renders, so `BaseLayout` stays unaware of post data
 * and the agent layer adds no coupling to page components.
 */

export type PostCollection = 'blogs' | 'leetcode'

export interface PageSection {
  id: string
  text: string
  depth: number
}

export interface PageContext {
  path: string
  collection: PostCollection | null
  /** Bare slug, e.g. `vue3-contribution`. Null on list pages. */
  slug: string | null
  /** Namespaced key the comments API expects, e.g. `blogs/vue3-contribution`. */
  commentKey: string | null
  title: string
  hasComments: boolean
  sections: PageSection[]
}

export function inferCollection(pathname: string): PostCollection | null {
  if (pathname === '/posts' || pathname.startsWith('/posts/')) return 'blogs'
  if (pathname === '/leetcode' || pathname.startsWith('/leetcode/')) return 'leetcode'
  return null
}

/**
 * Reason: `@/lib/comments` cannot be imported from client code — it pulls in
 * `@/lib/github` and `@/lib/comments-token`, which read server-side env and would
 * leak into the browser bundle. Mirroring this one-line format is the cheaper trade.
 * Must stay in sync with `commentKey()` in `src/lib/comments.ts`.
 */
export function toCommentKey(collection: PostCollection, slug: string): string {
  return `${collection}/${slug}`
}

/** Converts a site path (or an already-namespaced key) into a comments API key. */
export function commentKeyFromPath(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null

  const bare = raw.replace(/^\/+|\/+$/g, '')
  if (/^(blogs|leetcode)\/.+/.test(bare)) return bare

  const path = `/${bare}`
  const blogMatch = path.match(/^\/posts\/(.+)$/)
  if (blogMatch) return toCommentKey('blogs', blogMatch[1])
  const leetcodeMatch = path.match(/^\/leetcode\/(.+)$/)
  if (leetcodeMatch) return toCommentKey('leetcode', leetcodeMatch[1])

  return null
}

function deriveSlugFromPath(path: string, collection: PostCollection | null): string | null {
  if (!collection) return null
  const rest = path.replace(/^\/(?:posts|leetcode)\/?/, '').replace(/\/$/, '')
  return rest || null
}

function readSections(): PageSection[] {
  const nodes = document.querySelectorAll<HTMLHeadingElement>(
    '.prose h2[id], .prose h3[id], .prose h4[id]',
  )
  return Array.from(nodes)
    .map(el => ({
      id: el.id,
      text: el.textContent?.trim() ?? '',
      depth: Number(el.tagName.slice(1)),
    }))
    .filter(section => section.text)
}

export function getPageContext(): PageContext {
  const path = location.pathname
  const collection = inferCollection(path)
  const commentsRoot = document.querySelector<HTMLElement>('[data-comments]')

  const commentKey = commentsRoot?.dataset.slug || null
  const slug = commentKey
    ? commentKey.slice(commentKey.indexOf('/') + 1)
    : deriveSlugFromPath(path, collection)

  const title =
    commentsRoot?.dataset.title
    || document.querySelector('.article-title')?.textContent?.trim()
    || document.title

  return {
    path,
    collection,
    slug,
    commentKey,
    title,
    hasComments: Boolean(commentsRoot),
    sections: readSections(),
  }
}
