/**
 * GitHub Contents / git refs helpers for Keystatic draft workflow.
 * Auth: caller passes the Keystatic GitHub App user OAuth token
 * (cookie `keystatic-gh-access-token`).
 */

export const REPO_OWNER = 'priority3'
export const REPO_NAME = 'priority.me'
export const MAIN_BRANCH = 'main'
export const DRAFT_BRANCH = 'keystatic/drafts'

const API = 'https://api.github.com'

export class GitHubError extends Error {
  status: number
  body: string

  constructor(message: string, status: number, body: string) {
    super(message)
    this.name = 'GitHubError'
    this.status = status
    this.body = body
  }
}

type GhJson = Record<string, unknown>

async function gh<T = GhJson>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
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

export function contentPath(collection: string, slug: string) {
  return `src/content/${collection}/${slug}.md`
}

export type RepoFile = {
  path: string
  content: string
  sha: string
}

/** Fetch a text file from a branch. Returns null if missing. */
export async function getFile(
  token: string,
  path: string,
  ref: string,
): Promise<RepoFile | null> {
  try {
    const data = await gh<{
      content?: string
      encoding?: string
      sha: string
      path: string
    }>(
      token,
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`,
    )
    if (!data.content || data.encoding !== 'base64') {
      // directory or non-file
      return null
    }
    const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString(
      'utf8',
    )
    return { path: data.path, content, sha: data.sha }
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return null
    throw err
  }
}

/** Create or update a text file on a branch (one commit). */
export async function putFile(
  token: string,
  path: string,
  content: string,
  branch: string,
  message: string,
  sha?: string,
): Promise<void> {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
  }
  if (sha) body.sha = sha

  await gh(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURI(path)}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
}

/** Delete a file on a branch (one commit). No-op if missing. */
export async function deleteFile(
  token: string,
  path: string,
  branch: string,
  message: string,
): Promise<boolean> {
  const existing = await getFile(token, path, branch)
  if (!existing) return false

  await gh(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURI(path)}`,
    {
      method: 'DELETE',
      body: JSON.stringify({
        message,
        branch,
        sha: existing.sha,
      }),
    },
  )
  return true
}

/** Ensure `keystatic/drafts` exists (created from main tip). */
export async function ensureDraftBranch(token: string): Promise<void> {
  try {
    await gh(
      token,
      `/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/${encodeURIComponent(DRAFT_BRANCH)}`,
    )
    return
  } catch (err) {
    if (!(err instanceof GitHubError) || err.status !== 404) throw err
  }

  const mainRef = await gh<{ object: { sha: string } }>(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/${encodeURIComponent(MAIN_BRANCH)}`,
  )

  try {
    await gh(token, `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${DRAFT_BRANCH}`,
        sha: mainRef.object.sha,
      }),
    })
  } catch (err) {
    // Race: another request created it
    if (err instanceof GitHubError && (err.status === 422 || err.status === 409))
      return
    throw err
  }
}

/** Pull image paths referenced by markdown that live under /images/. */
export function extractImagePaths(markdown: string): string[] {
  const paths = new Set<string>()
  const re = /(?:!\[[^\]]*]\()((?:\/images\/)[^)\s]+)\)|(?:src=["'])((?:\/images\/)[^"']+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(markdown))) {
    const raw = m[1] || m[2]
    if (!raw) continue
    // public URL /images/foo → repo path public/images/foo
    const repoPath = raw.startsWith('/images/')
      ? `public${raw}`
      : raw.replace(/^\//, '')
    paths.add(repoPath)
  }
  return [...paths]
}

/**
 * Copy a blob from one branch to another (text or binary via GitHub content API).
 * Skips if destination already has identical sha.
 */
export async function copyFileBetweenBranches(
  token: string,
  path: string,
  fromBranch: string,
  toBranch: string,
  message: string,
): Promise<boolean> {
  // Use the raw API to preserve binary (images)
  let data: {
    content?: string
    encoding?: string
    sha: string
  }
  try {
    data = await gh(
      token,
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURI(path)}?ref=${encodeURIComponent(fromBranch)}`,
    )
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return false
    throw err
  }
  if (!data.content || data.encoding !== 'base64') return false

  let destSha: string | undefined
  try {
    const dest = await gh<{ sha: string }>(
      token,
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURI(path)}?ref=${encodeURIComponent(toBranch)}`,
    )
    if (dest.sha === data.sha) return false
    destSha = dest.sha
  } catch (err) {
    if (!(err instanceof GitHubError) || err.status !== 404) throw err
  }

  const body: Record<string, string> = {
    message,
    content: data.content.replace(/\n/g, ''),
    branch: toBranch,
    // encoding defaults to base64
  }
  if (destSha) body.sha = destSha

  await gh(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURI(path)}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
  return true
}
