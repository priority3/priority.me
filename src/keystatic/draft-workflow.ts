/**
 * Keystatic Admin draft workflow (client-only).
 *
 * Production (GitHub storage):
 * - Force collection item/create routes onto `keystatic/drafts` branch
 *   (prepare copies main → drafts when editing a published entry)
 * - Keystatic native Save = commit to drafts only
 * - Inject 「发布」 button → POST publish → main + delete draft
 * - Block empty title/body on Save (capture form submit) and Publish
 *
 * Local storage mode: no-op (dev writes disk as usual).
 */

import { DRAFT_BRANCH } from '../lib/draft-constants'

const BANNER_ID = 'priority-draft-banner'
const TOAST_ID = 'priority-draft-toast'

const COLLECTION_RE =
  /\/keystatic\/branch\/([^/]+)\/collection\/(blogs|leetcode)\/(item|create)(?:\/([^/]+))?/

function githubMode(): boolean {
  try {
    return Boolean(__KEYSTATIC_USE_GITHUB__)
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
  const m = COLLECTION_RE.exec(path)
  if (!m) return null
  return {
    branch: decodeBranch(m[1]),
    collection: m[2] as 'blogs' | 'leetcode',
    mode: m[3] as 'item' | 'create',
    slug: m[4] ? decodeURIComponent(m[4]) : null,
  }
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
  }, 4200)
}

/** Read visible title field + document editor text roughly for empty checks. */
function readEditorSnapshot(): { title: string; bodyText: string } {
  // Title: Keystatic slug field — first text input in the content header area
  const inputs = document.querySelectorAll<HTMLInputElement>(
    'input[type="text"], input:not([type])',
  )
  let title = ''
  for (const input of inputs) {
    // Skip search boxes in sidebar
    if (input.closest('nav, [role="search"], [data-priority-draft]')) continue
    const val = input.value?.trim() ?? ''
    if (val) {
      title = val
      break
    }
  }

  // Body: contenteditable / prose mirror surface
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
  if (!title) return '标题不能为空，请填写后再保存/发布'
  if (!bodyText) return '正文不能为空，请填写后再保存/发布'
  return null
}

function ensureStyles() {
  if (document.getElementById('priority-draft-style')) return
  const style = document.createElement('style')
  style.id = 'priority-draft-style'
  style.textContent = `
    #${BANNER_ID} {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      font: 13px/1.4 system-ui, sans-serif;
      color: #24231f;
      background: color-mix(in srgb, #f5e0e4 70%, #fefefb);
      border-bottom: 1px solid #e6b0ba;
      box-shadow: 0 1px 0 rgb(0 0 0 / 4%);
    }
    #${BANNER_ID}[data-dark="1"] {
      color: #f5f5f7;
      background: color-mix(in srgb, #3a2429 80%, #1c1c1e);
      border-bottom-color: #5c3840;
    }
    #${BANNER_ID} .pd-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    #${BANNER_ID} button, #${BANNER_ID} label {
      font: inherit;
    }
    #${BANNER_ID} button {
      cursor: pointer;
      border-radius: 8px;
      border: 1px solid #d9929f;
      background: #c56473;
      color: #fff;
      padding: 6px 12px;
      font-weight: 600;
    }
    #${BANNER_ID} button[data-secondary] {
      background: transparent;
      color: inherit;
      border-color: #d0cec6;
    }
    #${BANNER_ID} button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    #${BANNER_ID} .pd-note {
      opacity: 0.85;
      max-width: 52rem;
    }
    #${TOAST_ID} {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10001;
      max-width: min(420px, calc(100vw - 32px));
      padding: 10px 14px;
      border-radius: 10px;
      font: 13px/1.4 system-ui, sans-serif;
      background: #24231f;
      color: #fefefb;
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
      transition: opacity .2s, transform .2s;
    }
    #${TOAST_ID}[data-show="1"] {
      opacity: 1;
      transform: none;
    }
    #${TOAST_ID}[data-kind="error"] { background: #8f3f4d; }
    #${TOAST_ID}[data-kind="ok"] { background: #3d6b4f; }
    /* Make room so Keystatic header isn't covered */
    body:has(#${BANNER_ID}) {
      scroll-padding-top: 52px;
    }
  `
  document.head.appendChild(style)
}

function isDarkUi() {
  return Boolean(
    document.querySelector('.kui-scheme--dark')
      || (document.querySelector('.kui-scheme--auto')
        && window.matchMedia('(prefers-color-scheme: dark)').matches),
  )
}

async function redirectToDraftsIfNeeded(): Promise<boolean> {
  const route = parseRoute()
  if (!route) return false
  if (route.branch === DRAFT_BRANCH) return false

  // Only redirect away from main (or any non-draft branch) for item/create
  const slug = route.slug
  // create may have no slug yet — still move user onto drafts branch
  if (route.mode === 'item' && slug) {
    try {
      toast('正在准备草稿分支…', 'info')
      await api({
        action: 'prepare',
        collection: route.collection,
        slug,
      })
    } catch (err) {
      toast(
        err instanceof Error ? err.message : '准备草稿失败',
        'error',
      )
      return false
    }
  } else if (route.mode === 'create') {
    // Ensure drafts branch exists before Keystatic Save on create
    try {
      await api({
        action: 'prepare',
        collection: route.collection,
        slug: '__branch_bootstrap__',
      })
    } catch (err) {
      // Non-fatal: Save may still create the branch via GitHub UI errors
      console.warn('[draft-workflow] ensure branch', err)
    }
  }

  const encodedBranch = encodeURIComponent(DRAFT_BRANCH)
  const rest = location.pathname.replace(
    /\/keystatic\/branch\/[^/]+/,
    `/keystatic/branch/${encodedBranch}`,
  )
  const next = rest + location.search + location.hash
  location.replace(next)
  return true
}

function ensureBanner() {
  const route = parseRoute()
  if (!route || route.branch !== DRAFT_BRANCH) {
    document.getElementById(BANNER_ID)?.remove()
    return
  }

  ensureStyles()
  let ban = document.getElementById(BANNER_ID) as HTMLDivElement | null
  if (!ban) {
    ban = document.createElement('div')
    ban.id = BANNER_ID
    ban.dataset.priorityDraft = '1'
    ban.innerHTML = `
      <div class="pd-note">
        <strong>草稿模式</strong>
        · 右上角 <strong>Save</strong> 只提交到 <code>${DRAFT_BRANCH}</code>（不会上线）
        · 本地输入会自动缓存在浏览器
        · <strong>发布</strong> 才会写入 main 并删除草稿
      </div>
      <div class="pd-actions">
        <label title="发布后是否在站点列表展示">
          <input type="checkbox" id="pd-display" checked />
          发布后可见
        </label>
        <button type="button" data-secondary id="pd-refresh-status">状态</button>
        <button type="button" id="pd-publish">发布到 main</button>
      </div>
    `
    document.body.prepend(ban)

    ban.querySelector('#pd-publish')?.addEventListener('click', () => {
      void onPublish()
    })
    ban.querySelector('#pd-refresh-status')?.addEventListener('click', () => {
      void onStatus()
    })
  }
  ban.dataset.dark = isDarkUi() ? '1' : '0'
}

async function onStatus() {
  const route = parseRoute()
  if (!route?.slug) {
    toast('新建条目请先 Save 生成 slug', 'info')
    return
  }
  try {
    const data = await api({
      action: 'status',
      collection: route.collection,
      slug: route.slug,
    })
    toast(
      `草稿: ${data.hasDraft ? '有' : '无'} · 已发布: ${data.hasPublished ? '有' : '无'}`,
      'info',
    )
  } catch (err) {
    toast(err instanceof Error ? err.message : '状态查询失败', 'error')
  }
}

async function onPublish() {
  const route = parseRoute()
  if (!route) return

  const empty = assertNonEmpty()
  if (empty) {
    toast(empty, 'error')
    return
  }

  // Create flow: slug comes from title field after user types; URL may lack slug
  let slug = route.slug
  if (!slug) {
    const { title } = readEditorSnapshot()
    slug = slugify(title)
  }
  if (!slug) {
    toast('请先填写标题，并点击 Save 保存草稿后再发布', 'error')
    return
  }

  const displayEl = document.getElementById('pd-display') as HTMLInputElement | null
  const display = displayEl ? displayEl.checked : true

  const btn = document.getElementById('pd-publish') as HTMLButtonElement | null
  if (btn) btn.disabled = true
  try {
    toast('发布中：写入 main 并清理草稿…', 'info')
    // Prefer server reading drafts branch (user must have Saved).
    // If draft missing, error message tells them to Save first.
    await api({
      action: 'publish',
      collection: route.collection,
      slug,
      display,
    })
    toast('已发布到 main，草稿已删除。站点将在 Netlify 构建后更新。', 'ok')
    // Jump to main item view
    const encodedMain = encodeURIComponent('main')
    const target =
      `/keystatic/branch/${encodedMain}/collection/${route.collection}/item/${encodeURIComponent(slug)}`
    window.setTimeout(() => {
      location.assign(target)
    }, 800)
  } catch (err) {
    toast(err instanceof Error ? err.message : '发布失败', 'error')
  } finally {
    if (btn) btn.disabled = false
  }
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}

/** Capture Save/Create form submit to enforce non-empty content. */
function installSaveGuard() {
  if ((window as unknown as { __pdSaveGuard?: boolean }).__pdSaveGuard) return
  ;(window as unknown as { __pdSaveGuard?: boolean }).__pdSaveGuard = true

  document.addEventListener(
    'click',
    (ev) => {
      const route = parseRoute()
      if (!route || route.branch !== DRAFT_BRANCH) return

      const t = ev.target as HTMLElement | null
      if (!t) return
      const btn = t.closest('button')
      if (!btn) return

      // Keystatic primary save label is "Save" or "Create"
      const label = (btn.textContent || '').trim()
      if (label !== 'Save' && label !== 'Create') return
      // Ignore our own buttons
      if (btn.closest('[data-priority-draft], #priority-draft-banner')) return

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

let routeWatchTimer = 0
let handling = false
let lastPath = ''

async function tick() {
  if (!githubMode()) return
  if (handling) return
  const path = location.pathname
  // Always refresh banner theme; only re-run redirect logic on path change
  const pathChanged = path !== lastPath
  handling = true
  try {
    if (pathChanged) {
      lastPath = path
      const redirected = await redirectToDraftsIfNeeded()
      if (redirected) return
      installSaveGuard()
    }
    ensureBanner()
  } finally {
    handling = false
  }
}

function scheduleTick() {
  window.clearTimeout(routeWatchTimer)
  routeWatchTimer = window.setTimeout(() => {
    void tick()
  }, 120)
}

export function ensureDraftWorkflow() {
  if (typeof document === 'undefined') return
  if (!githubMode()) return

  ensureStyles()
  void tick()

  // Keystatic is an SPA — watch history; light poll as fallback
  const wrap = (name: 'pushState' | 'replaceState') => {
    const orig = history[name]
    history[name] = function (this: History, ...args: Parameters<History['pushState']>) {
      const ret = orig.apply(this, args as Parameters<typeof orig>)
      scheduleTick()
      return ret
    }
  }
  wrap('pushState')
  wrap('replaceState')
  window.addEventListener('popstate', scheduleTick)

  window.setInterval(() => {
    if (location.pathname !== lastPath) scheduleTick()
    else {
      // Keep banner theme in sync without full redirect logic
      const ban = document.getElementById(BANNER_ID)
      if (ban) ban.dataset.dark = isDarkUi() ? '1' : '0'
    }
  }, 1000)
}

ensureDraftWorkflow()
