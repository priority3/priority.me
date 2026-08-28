/**
 * Build-time search index consumed by the WebMCP content tools.
 *
 * Static endpoint — emitted as `dist/search-index.json` under `output: 'static'`.
 * Sourced through `getBlogPosts()` / `getLeetcodePosts()` so it inherits the same
 * `display !== false` filtering and date ordering as the rendered pages, and through
 * `postHref()` so indexed paths can never drift from the real routes.
 */

import type { APIRoute } from 'astro'
import { getBlogPosts, getLeetcodePosts, postHref, type PostEntry } from '@/lib/posts'
import { markdownToText } from '@/lib/markdown-text'
import type { IndexedPost, SearchIndex } from '@/lib/webmcp/search-index'

function toIndexed(entry: PostEntry, collection: 'blogs' | 'leetcode'): IndexedPost {
  const href = postHref(collection, entry.id)
  return {
    collection,
    slug: href.split('/').pop() ?? entry.id,
    href,
    title: entry.data.title,
    desc: entry.data.desc,
    tag: entry.data.tag,
    date: entry.data.date.toISOString(),
    text: markdownToText(entry.body ?? ''),
  }
}

export const GET: APIRoute = async () => {
  const [blogs, leetcode] = await Promise.all([getBlogPosts(), getLeetcodePosts()])

  const index: SearchIndex = {
    version: 1,
    posts: [
      ...blogs.map(entry => toIndexed(entry, 'blogs')),
      ...leetcode.map(entry => toIndexed(entry, 'leetcode')),
    ],
  }

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
