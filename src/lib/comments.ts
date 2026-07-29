/**
 * Blog comments backed by GitHub Issues.
 *
 * - One issue per post, created lazily on the first comment
 * - Label: blog-comment
 * - Issue body carries a machine marker for slug lookup
 * - Visitor identity via GitHub OAuth (read:user); writes use server token
 *   with an HTML comment meta header so the UI can show the real author
 */

import { REPO_NAME, REPO_OWNER } from '@/lib/github'

export const COMMENT_LABEL = 'blog-comment'
export const COMMENT_LABEL_DESCRIPTION = 'Blog post comments (auto-managed)'
export const COMMENT_LABEL_COLOR = 'c56473'

/** Hidden marker in issue body — do not change (breaks lookup). */
export const SLUG_MARKER_RE =
  /<!--\s*blog-slug:([a-zA-Z0-9._~/-]+)\s*-->/

export type CommentCollection = 'blogs' | 'leetcode'

export function isCommentCollection(v: unknown): v is CommentCollection {
  return v === 'blogs' || v === 'leetcode'
}

/** Stable key used for issue map + marker (avoids blogs/leetcode id clashes). */
export function commentKey(collection: CommentCollection, slug: string): string {
  return `${collection}/${slug}`
}

/** Public path on the site for a comment key or bare slug. */
export function postPathFromCommentKey(key: string): string {
  if (key.startsWith('leetcode/')) return `/${key}`
  if (key.startsWith('blogs/')) return `/posts/${key.slice('blogs/'.length)}`
  // legacy bare slug → blogs
  return `/posts/${key}`
}

export function parseCommentKey(key: string): {
  collection: CommentCollection | null
  slug: string
} {
  if (key.startsWith('leetcode/')) {
    return { collection: 'leetcode', slug: key.slice('leetcode/'.length) }
  }
  if (key.startsWith('blogs/')) {
    return { collection: 'blogs', slug: key.slice('blogs/'.length) }
  }
  return { collection: null, slug: key }
}

/** Hidden meta on each issue comment. */
export const COMMENT_META_RE =
  /^<!--\s*comment-meta:([\s\S]*?)-->\s*\n?/

export const MAX_COMMENT_LENGTH = 4000
export const SESSION_COOKIE = 'blog_comment_session'
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30 // 30 days

export type CommentAuthor = {
  id: number
  login: string
  name: string | null
  avatarUrl: string
  htmlUrl: string
}

export type BlogComment = {
  id: number
  body: string
  createdAt: string
  updatedAt: string
  htmlUrl: string
  author: CommentAuthor
}

export type CommentsPublic = {
  slug: string
  issueNumber: number | null
  issueUrl: string | null
  comments: BlogComment[]
  configured: boolean
}

export function issueTitle(slug: string, postTitle: string): string {
  const safeTitle = postTitle.trim().slice(0, 60) || slug
  // Key first so search/title match stays stable if the display title changes.
  return `[comment] ${slug} — ${safeTitle}`
}

export function issueBody(slug: string, postTitle: string, postUrl: string): string {
  return [
    `<!-- blog-slug:${slug} -->`,
    '',
    `Comments for **${postTitle}**.`,
    '',
    `- Post: ${postUrl}`,
    `- Key: \`${slug}\``,
    '',
    '_This issue is auto-managed by the site comment system. Please discuss via the site UI when possible._',
  ].join('\n')
}

export function encodeCommentBody(author: CommentAuthor, text: string): string {
  const meta = JSON.stringify({
    id: author.id,
    login: author.login,
    name: author.name,
    avatarUrl: author.avatarUrl,
    htmlUrl: author.htmlUrl,
  })
  return `<!-- comment-meta:${meta} -->\n${text.trim()}`
}

export function decodeCommentBody(raw: string): {
  body: string
  author: CommentAuthor | null
} {
  const m = raw.match(COMMENT_META_RE)
  if (!m) return { body: raw.trim(), author: null }
  try {
    const parsed = JSON.parse(m[1]!) as Partial<CommentAuthor>
    if (
      typeof parsed.id !== 'number' ||
      typeof parsed.login !== 'string' ||
      typeof parsed.avatarUrl !== 'string' ||
      typeof parsed.htmlUrl !== 'string'
    ) {
      return { body: raw.replace(COMMENT_META_RE, '').trim(), author: null }
    }
    return {
      body: raw.replace(COMMENT_META_RE, '').trim(),
      author: {
        id: parsed.id,
        login: parsed.login,
        name: typeof parsed.name === 'string' ? parsed.name : null,
        avatarUrl: parsed.avatarUrl,
        htmlUrl: parsed.htmlUrl,
      },
    }
  } catch {
    return { body: raw.replace(COMMENT_META_RE, '').trim(), author: null }
  }
}

export function extractSlugFromIssueBody(body: string | null | undefined): string | null {
  if (!body) return null
  const m = body.match(SLUG_MARKER_RE)
  return m?.[1] ?? null
}

export function commentsRepoPath(): string {
  return `${REPO_OWNER}/${REPO_NAME}`
}

export function issueHtmlUrl(number: number): string {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/${number}`
}

/** Normalize and validate post slug from content collection ids. */
export function normalizeSlug(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.trim()
  if (!s || s.length > 200) return null
  if (!/^[a-zA-Z0-9._~/-]+$/.test(s)) return null
  if (s.includes('..')) return null
  return s
}

export function sanitizeCommentText(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const text = raw.replace(/\r\n/g, '\n').trim()
  if (!text || text.length > MAX_COMMENT_LENGTH) return null
  return text
}

import { commentsWriteConfigured } from '@/lib/comments-token'

export function commentsConfigured(): boolean {
  return Boolean(
    commentsWriteConfigured() &&
      process.env.COMMENTS_GITHUB_CLIENT_ID?.trim() &&
      process.env.COMMENTS_GITHUB_CLIENT_SECRET?.trim() &&
      process.env.COMMENTS_SESSION_SECRET?.trim(),
  )
}
