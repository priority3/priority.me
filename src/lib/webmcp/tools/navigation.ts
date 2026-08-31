/**
 * Navigation tools: move the user around the site, and tell the agent where it currently is.
 *
 * Tool descriptions are in English for the agent's model; result text stays in Chinese.
 */

import { readString } from '../args'
import { getPageContext } from '../page-context'
import { err, ok, okJson } from '../result'
import type { ToolDefinition } from '../types'

/**
 * Route prefixes an agent may navigate to.
 *
 * Reason: an allowlist, not a denylist. `/keystatic` (the author's private CMS) and
 * `/api/*` are excluded by construction rather than by remembering to ban them.
 */
const ALLOWED_PREFIXES = ['/posts', '/leetcode'] as const

export type PathCheck =
  | { allowed: true; pathname: string; hash: string }
  | { allowed: false; reason: string }

/** Validates an agent-supplied path before it can drive a navigation. */
export function resolveInternalPath(input: string): PathCheck {
  const raw = input.trim()
  if (!raw) return { allowed: false, reason: '路径不能为空。' }

  // Reason: reject origin-escaping shapes before parsing. `//evil.example` is
  // protocol-relative and `javascript:` / `https:` carry a scheme — neither should
  // ever reach `new URL()` with our origin as the base.
  if (raw.includes('//')) {
    return { allowed: false, reason: '只接受站内相对路径，不接受绝对 URL 或协议相对路径。' }
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) {
    return { allowed: false, reason: '不接受带协议的地址，只允许站内路径。' }
  }
  if (!raw.startsWith('/')) {
    return { allowed: false, reason: '路径必须以 / 开头，例如 /posts/vue3-contribution。' }
  }

  let url: URL
  try {
    url = new URL(raw, location.origin)
  } catch {
    return { allowed: false, reason: '路径格式无效。' }
  }
  if (url.origin !== location.origin) {
    return { allowed: false, reason: '只允许在本站内导航。' }
  }

  const pathname = url.pathname.replace(/\/+$/, '') || '/'
  const allowed =
    pathname === '/'
    || ALLOWED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (!allowed) {
    return {
      allowed: false,
      reason:
        `不允许导航到 ${pathname}。`
        + '只允许 /、/posts、/posts/<slug>、/leetcode、/leetcode/<slug>。',
    }
  }

  return { allowed: true, pathname, hash: url.hash }
}

export const navigationTools: ToolDefinition[] = [
  {
    name: 'get-page-context',
    description:
      'Report what the user is currently looking at on this site: the path, which collection it '
      + 'belongs to, the article slug and title, whether a comment section exists, and the list of '
      + 'section headings on the page. Call this first to ground yourself before other tools.',
    inputSchema: { type: 'object', properties: {} },
    execute() {
      return okJson(getPageContext())
    },
  },

  {
    name: 'navigate-to-post',
    description:
      'Navigate the current tab to a page on this site. Only site-internal paths are accepted: '
      + '"/", "/posts", "/posts/<slug>", "/leetcode", "/leetcode/<slug>". External URLs and admin '
      + 'routes are rejected. Use search-posts first to obtain a valid path.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Site-internal path to open, e.g. "/posts/vue3-contribution".',
        },
      },
      required: ['path'],
    },
    execute(args) {
      const path = readString(args, 'path')
      if (!path) return err('参数 path 不能为空。')

      const check = resolveInternalPath(path)
      if (!check.allowed) return err(check.reason)

      const target = `${check.pathname}${check.hash}`
      // Reason: navigating tears down this page — and this promise — so hand the result
      // back to the agent first and let the unload happen on the next task.
      setTimeout(() => location.assign(target), 0)
      return ok(`正在跳转到 ${target}。`)
    },
  },

  {
    name: 'goto-section',
    description:
      'Scroll the current article to one of its section headings, matched by heading text '
      + '(exact match preferred, otherwise a case-insensitive substring). Use get-page-context to '
      + 'see the available headings.',
    inputSchema: {
      type: 'object',
      properties: {
        heading: {
          type: 'string',
          description: 'Heading text to scroll to, as shown in get-page-context sections.',
        },
      },
      required: ['heading'],
    },
    execute(args) {
      const heading = readString(args, 'heading')
      if (!heading) return err('参数 heading 不能为空。')

      const { sections } = getPageContext()
      if (!sections.length) return err('当前页面没有可跳转的小节标题。')

      const needle = heading.toLowerCase()
      const match =
        sections.find(section => section.text.toLowerCase() === needle)
        ?? sections.find(section => section.text.toLowerCase().includes(needle))

      if (!match) {
        return err(
          `未找到标题「${heading}」。当前页可用小节：${sections.map(s => s.text).join('、')}`,
        )
      }

      document.getElementById(match.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${match.id}`)
      return ok(`已跳转到「${match.text}」。`)
    },
  },
]
