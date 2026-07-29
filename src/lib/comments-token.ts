/**
 * Resolve a GitHub token that can read/write Issues on this repo.
 *
 * Prefers COMMENTS_GITHUB_TOKEN (PAT).
 * Else uses GitHub App JWT → installation access token
 * (COMMENTS_GITHUB_APP_ID + COMMENTS_GITHUB_PRIVATE_KEY).
 */

import { createSign } from 'crypto'
import { REPO_NAME, REPO_OWNER } from '@/lib/github'

const API = 'https://api.github.com'

/** Cached installation token (process-local; Netlify functions are short-lived). */
let cached: { token: string; exp: number } | null = null

function b64url(input: Buffer | string): string {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function normalizePem(raw: string): string {
  // Netlify env often stores PEM with literal \n
  let pem = raw.trim().replace(/\\n/g, '\n')
  if (!pem.includes('BEGIN')) {
    // bare base64 body
    pem = `-----BEGIN RSA PRIVATE KEY-----\n${pem}\n-----END RSA PRIVATE KEY-----`
  }
  return pem
}

function appJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    }),
  )
  const data = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(data)
  signer.end()
  const sig = b64url(signer.sign(normalizePem(privateKey)))
  return `${data}.${sig}`
}

async function installationToken(): Promise<string> {
  const appId = process.env.COMMENTS_GITHUB_APP_ID?.trim()
  const privateKey = process.env.COMMENTS_GITHUB_PRIVATE_KEY?.trim()
  if (!appId || !privateKey) {
    throw new Error('GitHub App credentials missing for comments')
  }

  const now = Math.floor(Date.now() / 1000)
  if (cached && cached.exp > now + 60) return cached.token

  const jwt = appJwt(appId, privateKey)

  // Resolve installation on this repo
  const instRes = await fetch(
    `${API}/repos/${REPO_OWNER}/${REPO_NAME}/installation`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${jwt}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'priority.me-comments',
      },
    },
  )
  if (!instRes.ok) {
    const text = await instRes.text()
    throw new Error(
      `Comments GitHub App is not installed on ${REPO_OWNER}/${REPO_NAME} (${instRes.status}): ${text}`,
    )
  }
  const inst = (await instRes.json()) as { id: number }

  const tokenRes = await fetch(
    `${API}/app/installations/${inst.id}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${jwt}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'priority.me-comments',
      },
    },
  )
  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    throw new Error(`Failed to mint installation token (${tokenRes.status}): ${text}`)
  }
  const body = (await tokenRes.json()) as {
    token: string
    expires_at: string
  }
  const exp = Math.floor(new Date(body.expires_at).getTime() / 1000)
  cached = { token: body.token, exp }
  return body.token
}

/** Bearer token for Issues API. */
export async function getCommentsGithubToken(): Promise<string> {
  const pat = process.env.COMMENTS_GITHUB_TOKEN?.trim()
  if (pat) return pat
  return installationToken()
}

export function commentsWriteConfigured(): boolean {
  if (process.env.COMMENTS_GITHUB_TOKEN?.trim()) return true
  return Boolean(
    process.env.COMMENTS_GITHUB_APP_ID?.trim() &&
      process.env.COMMENTS_GITHUB_PRIVATE_KEY?.trim(),
  )
}
