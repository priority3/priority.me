/**
 * GET  /api/comments?slug=...  — list comments for a post (public)
 * POST /api/comments           — create comment (GitHub session required)
 *                              — creates the issue lazily on first comment
 */
export const prerender = false

import type { APIRoute } from 'astro'
import {
  commentsConfigured,
  normalizeSlug,
  postPathFromCommentKey,
  sanitizeCommentText,
  type CommentsPublic,
} from '@/lib/comments'
import { getSessionFromRequest } from '@/lib/comments-auth'
import {
  createIssueForPost,
  findIssueNumber,
  issueHtmlUrl,
  listIssueComments,
  postIssueComment,
} from '@/lib/comments-github'
import { site } from '@/lib/site'
import { GitHubError } from '@/lib/github'

const json = (data: unknown, status = 200, extraHeaders?: HeadersInit) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  })

function siteOrigin(request: Request): string {
  const env = process.env.URL || process.env.DEPLOY_PRIME_URL
  if (env) return env.replace(/\/$/, '')
  try {
    return new URL(request.url).origin
  } catch {
    return site.url.replace(/\/$/, '')
  }
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const slug = normalizeSlug(url.searchParams.get('slug'))
  if (!slug) return json({ error: 'Missing or invalid slug' }, 400)

  if (!commentsConfigured()) {
    const empty: CommentsPublic = {
      slug,
      issueNumber: null,
      issueUrl: null,
      comments: [],
      configured: false,
    }
    return json(empty)
  }

  try {
    const issueNumber = await findIssueNumber(slug)
    if (!issueNumber) {
      const empty: CommentsPublic = {
        slug,
        issueNumber: null,
        issueUrl: null,
        comments: [],
        configured: true,
      }
      return json(empty)
    }

    const comments = await listIssueComments(issueNumber)
    const body: CommentsPublic = {
      slug,
      issueNumber,
      issueUrl: issueHtmlUrl(issueNumber),
      comments,
      configured: true,
    }
    return json(body)
  } catch (err) {
    console.error('[comments] GET failed', err)
    const status = err instanceof GitHubError ? err.status : 500
    return json({ error: 'Failed to load comments' }, status >= 400 ? status : 500)
  }
}

type PostBody = {
  slug?: string
  body?: string
  postTitle?: string
}

export const POST: APIRoute = async ({ request }) => {
  if (!commentsConfigured()) {
    return json({ error: 'Comments are not configured on this site' }, 503)
  }

  const session = getSessionFromRequest(request)
  if (!session) {
    return json({ error: '请先使用 GitHub 登录后再评论' }, 401)
  }

  let raw: PostBody
  try {
    raw = (await request.json()) as PostBody
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const slug = normalizeSlug(raw.slug)
  const text = sanitizeCommentText(raw.body)
  if (!slug) return json({ error: 'Missing or invalid slug' }, 400)
  if (!text) {
    return json(
      { error: `评论不能为空，且不超过 ${4000} 字` },
      400,
    )
  }

  const postTitle =
    typeof raw.postTitle === 'string' && raw.postTitle.trim()
      ? raw.postTitle.trim().slice(0, 120)
      : slug

  const author = {
    id: session.id,
    login: session.login,
    name: session.name,
    avatarUrl: session.avatarUrl,
    htmlUrl: session.htmlUrl,
  }

  try {
    let issueNumber = await findIssueNumber(slug)
    let createdIssue = false
    if (!issueNumber) {
      const origin = siteOrigin(request)
      const postUrl = `${origin}${postPathFromCommentKey(slug)}`
      issueNumber = await createIssueForPost({ slug, postTitle, postUrl })
      createdIssue = true
    }

    const comment = await postIssueComment(issueNumber, author, text)

    return json({
      ok: true,
      createdIssue,
      issueNumber,
      issueUrl: issueHtmlUrl(issueNumber),
      comment,
    })
  } catch (err) {
    console.error('[comments] POST failed', err)
    if (err instanceof GitHubError) {
      return json(
        { error: 'GitHub 写入失败', detail: err.status },
        err.status === 401 || err.status === 403 ? 502 : 500,
      )
    }
    return json({ error: '发表评论失败' }, 500)
  }
}

export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: { Allow: 'GET, POST, OPTIONS' },
  })
