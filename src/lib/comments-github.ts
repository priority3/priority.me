/**
 * GitHub Issues API for blog comments (server token).
 */

import {
  COMMENT_LABEL,
  COMMENT_LABEL_COLOR,
  COMMENT_LABEL_DESCRIPTION,
  commentsRepoPath,
  decodeCommentBody,
  encodeCommentBody,
  extractSlugFromIssueBody,
  issueBody,
  issueHtmlUrl,
  issueTitle,
  type BlogComment,
  type CommentAuthor,
} from '@/lib/comments'
import { GitHubError, REPO_NAME, REPO_OWNER } from '@/lib/github'
import { readIssueMap, writeIssueMap } from '@/lib/comments-store'
import { getCommentsGithubToken } from '@/lib/comments-token'

const API = 'https://api.github.com'

async function gh<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const tok = await getCommentsGithubToken()
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tok}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'priority.me-comments',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  })
  const text = await res.text()
  if (!res.ok) {
    throw new GitHubError(
      `GitHub ${init.method ?? 'GET'} ${path} failed: ${res.status}`,
      res.status,
      text,
    )
  }
  if (!text) return {} as T
  return JSON.parse(text) as T
}

type GhIssue = {
  number: number
  title: string
  body?: string | null
  html_url: string
  state: string
  pull_request?: unknown
}

type GhComment = {
  id: number
  body: string
  created_at: string
  updated_at: string
  html_url: string
  user: {
    id: number
    login: string
    avatar_url: string
    html_url: string
  } | null
}

async function ensureLabel(): Promise<void> {
  try {
    await gh(`/repos/${REPO_OWNER}/${REPO_NAME}/labels/${encodeURIComponent(COMMENT_LABEL)}`)
    return
  } catch (err) {
    if (!(err instanceof GitHubError) || err.status !== 404) throw err
  }

  try {
    await gh(`/repos/${REPO_OWNER}/${REPO_NAME}/labels`, {
      method: 'POST',
      body: JSON.stringify({
        name: COMMENT_LABEL,
        color: COMMENT_LABEL_COLOR,
        description: COMMENT_LABEL_DESCRIPTION,
      }),
    })
  } catch (err) {
    // Race: created by another request
    if (err instanceof GitHubError && (err.status === 422 || err.status === 409))
      return
    throw err
  }
}

/** Resolve issue number for a slug: Blobs map → GitHub search. */
export async function findIssueNumber(slug: string): Promise<number | null> {
  const map = await readIssueMap()
  const cached = map[slug]
  if (typeof cached === 'number' && cached > 0) return cached

  // Search open+closed issues with our label; filter by marker in body.
  // GitHub search can lag; map cache is the source of truth after first create.
  try {
    const q = encodeURIComponent(
      `repo:${commentsRepoPath()} label:"${COMMENT_LABEL}" "[comment] ${slug}" in:title`,
    )
    const data = await gh<{
      items?: GhIssue[]
    }>(`/search/issues?q=${q}&per_page=10`)

    for (const item of data.items ?? []) {
      let body = item.body
      if (!extractSlugFromIssueBody(body)) {
        try {
          const full = await gh<GhIssue>(
            `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${item.number}`,
          )
          body = full.body
        } catch {
          continue
        }
      }
      if (extractSlugFromIssueBody(body) === slug) {
        map[slug] = item.number
        await writeIssueMap(map)
        return item.number
      }
      // Title-based match when body marker missing (legacy / manual)
      if (
        item.title.startsWith(`[comment] ${slug}`) ||
        item.title.startsWith(`[blog] ${slug}`)
      ) {
        map[slug] = item.number
        await writeIssueMap(map)
        return item.number
      }
    }
  } catch (err) {
    console.warn('[comments] issue search failed', err)
  }

  // Fallback: scan labeled issues (small blogs stay fine).
  try {
    const listed = await gh<GhIssue[]>(
      `/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=${encodeURIComponent(COMMENT_LABEL)}&state=all&per_page=50`,
    )
    for (const item of listed) {
      if (item.pull_request) continue
      if (
        extractSlugFromIssueBody(item.body) === slug ||
        item.title.startsWith(`[comment] ${slug}`) ||
        item.title.startsWith(`[blog] ${slug}`)
      ) {
        map[slug] = item.number
        await writeIssueMap(map)
        return item.number
      }
    }
  } catch (err) {
    console.warn('[comments] issue list fallback failed', err)
  }

  return null
}

export async function createIssueForPost(opts: {
  slug: string
  postTitle: string
  postUrl: string
}): Promise<number> {
  await ensureLabel()

  // Double-check race
  const existing = await findIssueNumber(opts.slug)
  if (existing) return existing

  const issue = await gh<GhIssue>(`/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
    method: 'POST',
    body: JSON.stringify({
      title: issueTitle(opts.slug, opts.postTitle),
      body: issueBody(opts.slug, opts.postTitle, opts.postUrl),
      labels: [COMMENT_LABEL],
    }),
  })

  const map = await readIssueMap()
  map[opts.slug] = issue.number
  await writeIssueMap(map)

  return issue.number
}

export async function listIssueComments(issueNumber: number): Promise<BlogComment[]> {
  const raw = await gh<GhComment[]>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments?per_page=100`,
  )

  return raw.map((c) => {
    const decoded = decodeCommentBody(c.body || '')
    const fallbackAuthor: CommentAuthor = {
      id: c.user?.id ?? 0,
      login: c.user?.login ?? 'unknown',
      name: null,
      avatarUrl: c.user?.avatar_url ?? '',
      htmlUrl: c.user?.html_url ?? `https://github.com/${c.user?.login ?? ''}`,
    }
    return {
      id: c.id,
      body: decoded.body,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      htmlUrl: c.html_url,
      author: decoded.author ?? fallbackAuthor,
    }
  })
}

export async function postIssueComment(
  issueNumber: number,
  author: CommentAuthor,
  text: string,
): Promise<BlogComment> {
  const body = encodeCommentBody(author, text)
  const c = await gh<GhComment>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({ body }),
    },
  )
  const decoded = decodeCommentBody(c.body || '')
  return {
    id: c.id,
    body: decoded.body || text,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    htmlUrl: c.html_url,
    author: decoded.author ?? author,
  }
}

export { issueHtmlUrl }
