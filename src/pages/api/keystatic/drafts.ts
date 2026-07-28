/**
 * Keystatic draft workflow API.
 *
 * POST body.action:
 *   - prepare  { collection, slug } → ensure drafts branch + checkout main file
 *   - publish  { collection, slug, markdown?, display? } → main + delete draft
 *   - status   { collection, slug } → whether draft/main exist
 *
 * Auth: cookie `keystatic-gh-access-token` (same as Keystatic Admin).
 */
export const prerender = false

import type { APIRoute } from 'astro'
import {
  isCollection,
  prepareDraft,
  publishDraft,
  type CollectionName,
} from '@/lib/drafts'
import {
  DRAFT_BRANCH,
  MAIN_BRANCH,
  contentPath,
  getFile,
  GitHubError,
} from '@/lib/github'

function parseCookieHeader(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const val = part.slice(idx + 1).trim()
    if (!key) continue
    try {
      out[key] = decodeURIComponent(val)
    } catch {
      out[key] = val
    }
  }
  return out
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })

function getToken(request: Request): string | null {
  const raw = request.headers.get('cookie') || ''
  const cookies = parseCookieHeader(raw)
  return cookies['keystatic-gh-access-token'] || null
}

type Body = {
  action?: string
  collection?: string
  slug?: string
  markdown?: string
  display?: boolean
}

export const POST: APIRoute = async ({ request }) => {
  const token = getToken(request)
  if (!token) {
    return json(
      {
        error:
          '未登录 GitHub。请先在 Keystatic 完成 GitHub App 授权后再保存/发布。',
      },
      401,
    )
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const action = body.action
  const collection = body.collection
  const slug = body.slug?.trim()

  if (!action) return json({ error: 'action is required' }, 400)
  if (!collection || !isCollection(collection)) {
    return json({ error: 'collection must be blogs | leetcode' }, 400)
  }
  if (!slug) return json({ error: 'slug is required' }, 400)

  try {
    if (action === 'prepare') {
      const result = await prepareDraft(token, collection, slug)
      return json({ ok: true, ...result })
    }

    if (action === 'publish') {
      const result = await publishDraft(token, collection as CollectionName, slug, {
        markdown: body.markdown,
        display: body.display,
      })
      return json({ ok: true, ...result, branch: MAIN_BRANCH })
    }

    if (action === 'status') {
      const path = contentPath(collection, slug)
      const [draft, main] = await Promise.all([
        getFile(token, path, DRAFT_BRANCH),
        getFile(token, path, MAIN_BRANCH),
      ])
      return json({
        ok: true,
        path,
        draftBranch: DRAFT_BRANCH,
        mainBranch: MAIN_BRANCH,
        hasDraft: Boolean(draft),
        hasPublished: Boolean(main),
        draftUpdatedHint: draft ? 'present' : null,
      })
    }

    return json({ error: `Unknown action: ${action}` }, 400)
  } catch (err) {
    if (err instanceof GitHubError) {
      console.error('[drafts]', err.status, err.body)
      return json(
        {
          error: err.message,
          githubStatus: err.status,
          githubBody: safeJson(err.body),
        },
        err.status === 401 || err.status === 403 ? err.status : 502,
      )
    }
    const message = err instanceof Error ? err.message : String(err)
    console.error('[drafts]', message)
    return json({ error: message }, 400)
  }
}

export const GET: APIRoute = async ({ request, url }) => {
  const token = getToken(request)
  if (!token) return json({ error: 'Unauthorized' }, 401)

  const collection = url.searchParams.get('collection') || ''
  const slug = url.searchParams.get('slug') || ''
  if (!isCollection(collection) || !slug) {
    return json({ error: 'collection + slug required' }, 400)
  }

  const path = contentPath(collection, slug)
  try {
    const draft = await getFile(token, path, DRAFT_BRANCH)
    return json({
      ok: true,
      path,
      hasDraft: Boolean(draft),
      markdown: draft?.content ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return json({ error: message }, 502)
  }
}

export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: { Allow: 'GET, POST, OPTIONS' },
  })

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text.slice(0, 500)
  }
}
