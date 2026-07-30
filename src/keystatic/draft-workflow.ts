/**
 * Keystatic Admin draft workflow (client-only).
 *
 * Commit timing:
 * - Auto-save (IndexedDB): continuous while typing — never a Git commit
 * - 「保存草稿」: triggers Keystatic native Save/Create
 *     · local mode  → write files on disk
 *     · github mode → commit to branch `keystatic/drafts` only
 * - 「发布」 (github + drafts only): promote entry to main, delete draft
 *
 * UI: inject a compact action group into the Keystatic page header
 * next to the native Save control (no full-width tip banner).
 */

import { DRAFT_BRANCH } from '../lib/draft-constants'

const TOOLBAR_ID = 'priority-draft-toolbar'
const TOAST_ID = 'priority-draft-toast'
const STYLE_ID = 'priority-draft-style'

const COLLECTION_RE =
  /\/keystatic\/branch\/([^/]+)\/collection\/(blogs|leetcode)\/(item|create)(?:\/([^/]+))?/
// Local mode has no /branch/ segment
const LOCAL_COLLECTION_RE =
  /\/keystatic\/collection\/(blogs|leetcode)\/(item|create)(?:\/([^/]+))?/

/** Inlined by Vite (`astro.config.mjs`). Prefer import.meta fallback. */
function githubMode(): boolean {
  try {
    // eslint-disable-next-line no-undef
    if (typeof __KEYSTATIC_USE_GITHUB__ !== 'undefined') {
      return Boolean(__KEYSTATIC_USE_GITHUB__)
    }
  } catch {
    /* ignore */
  }
  try {
    const v = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env
      ?.KEYSTATIC_USE_GITHUB
    return v === true || v === 'true'
  } catch {
    return false
  }
}

function decodeBranch(seg: string) {
  try {
    return decodeURIComponent(seg)
  } catch {
    return seg
  }
}

function parseRoute() {
  const path = location.pathname
  const gh = COLLECTION_RE.exec(path)
  if (gh) {
    return {
      branch: decodeBranch(gh[1]),
      collection: gh[2] as 'blogs' | 'leetcode',
      mode: gh[3] as 'item' | 'create',
      slug: gh[4] ? decodeURIComponent(gh[4]) : null,
      githubUi: true as const,
    }
  }
  const local = LOCAL_COLLECTION_RE.exec(path)
  if (local) {
    return {
      branch: null as string | null,
      collection: local[1] as 'blogs' | 'leetcode',
      mode: local[2] as 'item' | 'create',
      slug: local[3] ? decodeURIComponent(local[3]) : null,
      githubUi: false as const,
    }
  }
  return null
}

function isEntryEditorRoute(route: NonNullable<ReturnType<typeof parseRoute>>) {
  return route.mode === 'item' || route.mode === 'create'
}

function isDraftEditing(route: NonNullable<ReturnType<typeof parseRoute>>) {
  // Local always edits "as draft" (disk). GitHub only on drafts branch.
  if (!githubMode()) return true
  return route.branch === DRAFT_BRANCH
}

async function api(body: Record<string, unknown>) {
  const res = await fetch('/api/keystatic/drafts', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (data && typeof data.error === 'string' && data.error)
        || `Request failed (${res.status})`,
    )
  }
  return data
}

function toast(message: string, kind: 'info' | 'error' | 'ok' = 'info') {
  ensureStyles()
  let el = document.getElementById(TOAST_ID)
  if (!el) {
    el = document.createElement('div')
    el.id = TOAST_ID
    document.body.appendChild(el)
  }
  el.textContent = message
  el.dataset.kind = kind
  el.dataset.show = '1'
  window.setTimeout(() => {
    if (el) el.dataset.show = '0'
  }, 3800)
}

function readEditorSnapshot(): { title: string; bodyText: string } {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    'input[type="text"], input:not([type])',
  )
  let title = ''
  for (const input of inputs) {
    if (input.closest('nav, [role="search"], [data-priority-draft]')) continue
    const val = input.value?.trim() ?? ''
    if (val) {
      title = val
      break
    }
  }

  const editables = document.querySelectorAll<HTMLElement>(
    '[contenteditable="true"]',
  )
  let bodyText = ''
  editables.forEach((node) => {
    if (node.closest('[data-priority-draft]')) return
    bodyText += ` ${node.innerText || node.textContent || ''}`
  })
  bodyText = bodyText.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  return { title, bodyText }
}

function assertNonEmpty(): string | null {
  const { title, bodyText } = readEditorSnapshot()
  if (!title) return '标题不能为空'
  if (!bodyText) return '正文不能为空'
  return null
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    #${TOOLBAR_ID} {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-inline-start: 8px;
      flex-shrink: 0;
    }
    #${TOOLBAR_ID} .pd-btn {
      appearance: none;
      cursor: pointer;
      border-radius: 999px;
      font: 600 13px/1.2 system-ui, -apple-system, "PingFang SC", "Segoe UI", sans-serif;
      letter-spacing: 0.01em;
      padding: 0 14px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background-color .15s, border-color .15s, opacity .15s, color .15s;
      white-space: nowrap;
    }
    #${TOOLBAR_ID} .pd-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    /* Secondary — 保存草稿 */
    #${TOOLBAR_ID} .pd-btn--save {
      border: 1px solid var(--kui-color-border-neutral, #d0cec6);
      background: var(--kui-color-background-surface, #f9f8f5);
      color: var(--kui-color-foreground-neutral-emphasis, #141312);
    }
    #${TOOLBAR_ID} .pd-btn--save:hover:not(:disabled) {
      background: var(--kui-color-background-surface-secondary, #f0efeb);
      border-color: var(--kui-color-alias-border-hovered, #a8a69f);
    }
    /* Primary — 发布 */
    #${TOOLBAR_ID} .pd-btn--publish {
      border: 1px solid transparent;
      background: var(--kui-color-background-accent-emphasis, #c56473);
      color: #fff;
    }
    #${TOOLBAR_ID} .pd-btn--publish:hover:not(:disabled) {
      filter: brightness(1.05);
    }
    /* Hide native EN Save/Create once our toolbar is mounted beside it */
    body.pd-has-toolbar button[type="submit"][form="item-edit-form"],
    body.pd-has-toolbar button[type="submit"][form="item-create-form"] {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
    #${TOAST_ID} {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10001;
      max-width: min(360px, calc(100vw - 32px));
      padding: 10px 14px;
      border-radius: 10px;
      font: 13px/1.4 system-ui, sans-serif;
      background: #24231f;
      color: #fefefb;
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
      transition: opacity .2s, transform .2s;
      box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
    }
    #${TOAST_ID}[data-show="1"] { opacity: 1; transform: none; }
    #${TOAST_ID}[data-kind="error"] { background: #8f3f4d; }
    #${TOAST_ID}[data-kind="ok"] { background: #3d6b4f; }
  `
  document.head.appendChild(style)
}

function findNativeSaveButton(): HTMLButtonElement | null {
  const byForm =
    document.querySelector<HTMLButtonElement>(
      'button[type="submit"][form="item-edit-form"]',
    )
    || document.querySelector<HTMLButtonElement>(
      'button[type="submit"][form="item-create-form"]',
    )
  if (byForm) return byForm

  for (const btn of document.querySelectorAll('button')) {
    if (btn.closest(`#${TOOLBAR_ID}`)) continue
    const label = (btn.textContent || '').trim()
    if (label === 'Save' || label === 'Create') return btn as HTMLButtonElement
  }
  return null
}

/** Header row that contains the page title + actions. */
function findHeaderActionsHost(): HTMLElement | null {
  const save = findNativeSaveButton()
  if (save?.parentElement) return save.parentElement

  const title = document.getElementById('page-title')
  if (title?.parentElement) return title.parentElement

  // Page header under main. Keystatic renders it as <header>; the previous
  // `:scope > div` fallback grabbed the Suspense loading Flex instead (first
  // div child of <main> while an item loads), rendering the toolbar mid-page
  // next to the spinner. Return null when absent — the ensureToolbar interval
  // retries until the header exists.
  const main = document.querySelector('main[id]')
  const header = main?.querySelector(':scope > header')
  return (header as HTMLElement) || null
}

function ensureToolbar() {
  const route = parseRoute()
  if (!route || !isDraftEditing(route)) {
    document.getElementById(TOOLBAR_ID)?.remove()
    document.body.classList.remove('pd-has-toolbar')
    // Remove legacy floating banner if any
    document.getElementById('priority-draft-banner')?.remove()
    return
  }

  ensureStyles()

  const host = findHeaderActionsHost()
  if (!host) return

  let bar = document.getElementById(TOOLBAR_ID) as HTMLDivElement | null
  const showPublish = githubMode() && route.branch === DRAFT_BRANCH

  if (!bar) {
    bar = document.createElement('div')
    bar.id = TOOLBAR_ID
    bar.dataset.priorityDraft = '1'
    bar.innerHTML = `
      <button type="button" class="pd-btn pd-btn--save" id="pd-save" title="保存到草稿（不会发布上线）">保存草稿</button>
      <button type="button" class="pd-btn pd-btn--publish" id="pd-publish" title="合并到 main 并删除草稿" hidden>发布</button>
    `
    // Prefer placing just before native save so layout stays in the action cluster
    const native = findNativeSaveButton()
    if (native?.parentElement === host) {
      host.insertBefore(bar, native)
    } else {
      host.appendChild(bar)
    }

    bar.querySelector('#pd-save')?.addEventListener('click', () => {
      onSaveDraft()
    })
    bar.querySelector('#pd-publish')?.addEventListener('click', () => {
      void onPublish()
    })
  }

  const pub = bar.querySelector('#pd-publish') as HTMLButtonElement | null
  if (pub) pub.hidden = !showPublish

  // Keep toolbar in the header if React re-rendered DOM
  if (bar.parentElement !== host) {
    const native = findNativeSaveButton()
    if (native?.parentElement === host) host.insertBefore(bar, native)
    else host.appendChild(bar)
  }

  document.body.classList.add('pd-has-toolbar')
  // Remove old floating control if present
  document.getElementById('priority-draft-banner')?.remove()
}

function onSaveDraft() {
  const empty = assertNonEmpty()
  if (empty) {
    toast(empty, 'error')
    return
  }

  const native = findNativeSaveButton()
  if (!native) {
    toast('未找到保存按钮，请稍候再试或检查是否有未填必填项', 'error')
    return
  }

  if (native.disabled) {
    toast('没有需要保存的更改', 'info')
    return
  }

  native.click()
  // GitHub: this commits to keystatic/drafts. Local: writes disk.
  toast(githubMode() ? '正在保存草稿…' : '正在保存…', 'info')
}

async function onPublish() {
  const route = parseRoute()
  if (!route || !githubMode()) return

  const empty = assertNonEmpty()
  if (empty) {
    toast(empty, 'error')
    return
  }

  let slug = route.slug
  if (!slug) {
    const { title } = readEditorSnapshot()
    slug = slugify(title)
  }
  if (!slug) {
    toast('请先填写标题并「保存草稿」，再发布', 'error')
    return
  }

  // If there are unsaved edits, save first
  const native = findNativeSaveButton()
  if (native && !native.disabled) {
    native.click()
    // Give Keystatic a moment to commit draft before publish reads the branch
    await wait(1200)
  }

  const btn = document.getElementById('pd-publish') as HTMLButtonElement | null
  if (btn) btn.disabled = true
  try {
    await api({
      action: 'publish',
      collection: route.collection,
      slug,
    })
    toast('已发布', 'ok')
    const target =
      `/keystatic/branch/${encodeURIComponent('main')}/collection/${route.collection}/item/${encodeURIComponent(slug)}`
    window.setTimeout(() => location.assign(target), 500)
  } catch (err) {
    toast(err instanceof Error ? err.message : '发布失败', 'error')
  } finally {
    if (btn) btn.disabled = false
  }
}

function wait(ms: number) {
  return new Promise<void>((r) => window.setTimeout(r, ms))
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}

function installSaveGuard() {
  if ((window as unknown as { __pdSaveGuard?: boolean }).__pdSaveGuard) return
  ;(window as unknown as { __pdSaveGuard?: boolean }).__pdSaveGuard = true

  document.addEventListener(
    'click',
    (ev) => {
      const route = parseRoute()
      if (!route || !isDraftEditing(route)) return

      const t = ev.target as HTMLElement | null
      if (!t) return
      const btn = t.closest('button')
      if (!btn) return
      if (btn.id === 'pd-save' || btn.id === 'pd-publish') return

      const isNativeSave =
        btn.getAttribute('form') === 'item-edit-form'
        || btn.getAttribute('form') === 'item-create-form'
        || ['Save', 'Create'].includes((btn.textContent || '').trim())
      if (!isNativeSave) return

      const empty = assertNonEmpty()
      if (empty) {
        ev.preventDefault()
        ev.stopPropagation()
        toast(empty, 'error')
      }
    },
    true,
  )
}

async function redirectToDraftsIfNeeded(): Promise<boolean> {
  if (!githubMode()) return false
  const route = parseRoute()
  if (!route?.githubUi) return false
  if (route.branch === DRAFT_BRANCH) return false

  const slug = route.slug
  if (route.mode === 'item' && slug) {
    try {
      await api({
        action: 'prepare',
        collection: route.collection,
        slug,
      })
    } catch (err) {
      toast(err instanceof Error ? err.message : '准备草稿失败', 'error')
      return false
    }
  } else if (route.mode === 'create') {
    try {
      await api({
        action: 'prepare',
        collection: route.collection,
        slug: '__branch_bootstrap__',
      })
    } catch (err) {
      console.warn('[draft-workflow] ensure branch', err)
    }
  }

  const encodedBranch = encodeURIComponent(DRAFT_BRANCH)
  const rest = location.pathname.replace(
    /\/keystatic\/branch\/[^/]+/,
    `/keystatic/branch/${encodedBranch}`,
  )
  location.replace(rest + location.search + location.hash)
  return true
}

let routeWatchTimer = 0
let handling = false
let lastPath = ''

async function tick() {
  if (handling) return
  const path = location.pathname
  const pathChanged = path !== lastPath
  handling = true
  try {
    if (pathChanged) {
      lastPath = path
      if (githubMode()) {
        const redirected = await redirectToDraftsIfNeeded()
        if (redirected) return
      }
      installSaveGuard()
    }
    ensureToolbar()
  } finally {
    handling = false
  }
}

function scheduleTick() {
  window.clearTimeout(routeWatchTimer)
  routeWatchTimer = window.setTimeout(() => {
    void tick()
  }, 100)
}

export function ensureDraftWorkflow() {
  if (typeof document === 'undefined') return

  ensureStyles()
  void tick()

  const wrap = (name: 'pushState' | 'replaceState') => {
    const orig = history[name]
    history[name] = function (
      this: History,
      ...args: Parameters<History['pushState']>
    ) {
      const ret = orig.apply(this, args as Parameters<typeof orig>)
      scheduleTick()
      return ret
    }
  }
  wrap('pushState')
  wrap('replaceState')
  window.addEventListener('popstate', scheduleTick)

  // Keystatic mounts header async — poll lightly while on an entry page
  window.setInterval(() => {
    if (location.pathname !== lastPath) scheduleTick()
    else if (parseRoute()) ensureToolbar()
  }, 800)
}

ensureDraftWorkflow()
