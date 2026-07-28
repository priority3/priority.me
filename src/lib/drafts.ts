/**
 * Draft branch workflow: prepare / save validation / publish+cleanup.
 */

import {
  DRAFT_BRANCH,
  MAIN_BRANCH,
  contentPath,
  copyFileBetweenBranches,
  deleteFile,
  ensureDraftBranch,
  extractImagePaths,
  getFile,
  putFile,
} from './github'

export const COLLECTIONS = ['blogs', 'leetcode'] as const
export type CollectionName = (typeof COLLECTIONS)[number]

export function isCollection(value: string): value is CollectionName {
  return (COLLECTIONS as readonly string[]).includes(value)
}

/** Reject empty title/slug or body (frontmatter-only counts as empty). */
export function validateEntryMarkdown(
  markdown: string,
  slug: string,
): { ok: true } | { ok: false; error: string } {
  if (!slug || !slug.trim()) {
    return { ok: false, error: 'Slug/title 不能为空' }
  }

  const trimmed = markdown.replace(/^\uFEFF/, '')
  if (!trimmed.trim()) {
    return { ok: false, error: '内容不能为空' }
  }

  // Split frontmatter
  let body = trimmed
  let title = ''
  if (trimmed.startsWith('---')) {
    const end = trimmed.indexOf('\n---', 3)
    if (end !== -1) {
      const fm = trimmed.slice(3, end).trim()
      body = trimmed.slice(end + 4)
      const titleMatch = /^title:\s*(.*)$/m.exec(fm)
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^["']|["']$/g, '')
      }
    }
  }

  if (!title) {
    return { ok: false, error: '标题不能为空' }
  }

  // Strip common empty markdoc/md shells
  const text = body
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/[#>*`_\-\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) {
    return { ok: false, error: '正文不能为空' }
  }

  return { ok: true }
}

/**
 * Ensure drafts branch exists. If entry is on main but not on drafts,
 * copy it so Keystatic can open the item on the draft branch.
 */
export async function prepareDraft(
  token: string,
  collection: CollectionName,
  slug: string,
): Promise<{
  branch: string
  path: string
  copiedFromMain: boolean
  hadDraft: boolean
}> {
  await ensureDraftBranch(token)

  // Internal: only create the drafts ref (no file ops)
  if (slug === '__branch_bootstrap__') {
    return {
      branch: DRAFT_BRANCH,
      path: contentPath(collection, slug),
      copiedFromMain: false,
      hadDraft: false,
    }
  }

  const path = contentPath(collection, slug)

  const draft = await getFile(token, path, DRAFT_BRANCH)
  if (draft) {
    return {
      branch: DRAFT_BRANCH,
      path,
      copiedFromMain: false,
      hadDraft: true,
    }
  }

  const main = await getFile(token, path, MAIN_BRANCH)
  if (main) {
    await putFile(
      token,
      path,
      main.content,
      DRAFT_BRANCH,
      `draft: checkout ${collection}/${slug} for editing`,
      undefined,
    )
    // Best-effort copy referenced images so draft preview assets resolve
    for (const img of extractImagePaths(main.content)) {
      try {
        await copyFileBetweenBranches(
          token,
          img,
          MAIN_BRANCH,
          DRAFT_BRANCH,
          `draft: asset ${img}`,
        )
      } catch {
        // non-fatal
      }
    }
    return {
      branch: DRAFT_BRANCH,
      path,
      copiedFromMain: true,
      hadDraft: false,
    }
  }

  // Brand-new entry: nothing to copy; create happens on Save in Keystatic
  return {
    branch: DRAFT_BRANCH,
    path,
    copiedFromMain: false,
    hadDraft: false,
  }
}

export type PublishOptions = {
  /** Override markdown body (e.g. from client). Default: read drafts branch. */
  markdown?: string
  /** If set, rewrite `display:` in frontmatter before writing main. */
  display?: boolean
}

/**
 * Promote draft → main, then delete draft file from drafts branch.
 */
export async function publishDraft(
  token: string,
  collection: CollectionName,
  slug: string,
  options: PublishOptions = {},
): Promise<{ path: string; display: boolean | null }> {
  await ensureDraftBranch(token)
  const path = contentPath(collection, slug)

  let markdown = options.markdown
  if (markdown == null) {
    const draft = await getFile(token, path, DRAFT_BRANCH)
    if (!draft) {
      // Allow publish from main working copy only if client sent body;
      // otherwise require a saved draft.
      throw new Error(
        '没有找到草稿。请先在草稿分支上点击 Save 保存，再发布。',
      )
    }
    markdown = draft.content
  }

  if (typeof options.display === 'boolean') {
    markdown = setFrontmatterBool(markdown, 'display', options.display)
  }

  const validation = validateEntryMarkdown(markdown, slug)
  if (!validation.ok) {
    throw new Error(validation.error)
  }

  const mainExisting = await getFile(token, path, MAIN_BRANCH)
  await putFile(
    token,
    path,
    markdown,
    MAIN_BRANCH,
    `publish(${collection}): ${slug}`,
    mainExisting?.sha,
  )

  // Copy images referenced in the published markdown from drafts → main
  for (const img of extractImagePaths(markdown)) {
    try {
      await copyFileBetweenBranches(
        token,
        img,
        DRAFT_BRANCH,
        MAIN_BRANCH,
        `publish(asset): ${img}`,
      )
    } catch {
      // try main already has it
    }
  }

  // Delete draft working copy
  await deleteFile(
    token,
    path,
    DRAFT_BRANCH,
    `chore: drop draft ${collection}/${slug} after publish`,
  )

  const display = readFrontmatterBool(markdown, 'display')
  return { path, display }
}

function setFrontmatterBool(
  markdown: string,
  key: string,
  value: boolean,
): string {
  if (!markdown.startsWith('---')) {
    return `---\n${key}: ${value}\n---\n\n${markdown}`
  }
  const end = markdown.indexOf('\n---', 3)
  if (end === -1) return markdown

  const fm = markdown.slice(3, end)
  const body = markdown.slice(end + 4)
  const lineRe = new RegExp(`^${key}:\\s*.*$`, 'm')
  let nextFm: string
  if (lineRe.test(fm)) {
    nextFm = fm.replace(lineRe, `${key}: ${value}`)
  } else {
    nextFm = `${fm.trimEnd()}\n${key}: ${value}\n`
  }
  return `---${nextFm}\n---${body}`
}

function readFrontmatterBool(
  markdown: string,
  key: string,
): boolean | null {
  if (!markdown.startsWith('---')) return null
  const end = markdown.indexOf('\n---', 3)
  if (end === -1) return null
  const fm = markdown.slice(3, end)
  const m = new RegExp(`^${key}:\\s*(true|false)\\s*$`, 'm').exec(fm)
  if (!m) return null
  return m[1] === 'true'
}
