/**
 * Comment tools: read discussions freely, but never publish without the user.
 *
 * Reason for the read/write asymmetry: posting a comment writes to a GitHub Issue under
 * the visitor's own identity and cannot be undone. Per WebMCP's human-in-the-loop design,
 * `draft-comment` only fills the existing textarea — the user presses submit.
 *
 * Tool descriptions are in English for the agent's model; result text stays in Chinese.
 */

import { readString } from '../args'
import { commentKeyFromPath, getPageContext } from '../page-context'
import { describeError, err, ok, okJson } from '../result'
import type { ToolDefinition } from '../types'

const COMMENTS_ENDPOINT = '/api/comments'
const ME_ENDPOINT = '/api/comments/me'

/** Must match `MAX_COMMENT_LENGTH` enforced by `sanitizeCommentText` in src/lib/comments.ts. */
const MAX_COMMENT_LENGTH = 4000

interface CommentAuthor {
  login: string
  name: string | null
  htmlUrl: string
}

interface BlogComment {
  id: number
  body: string
  createdAt: string
  htmlUrl: string
  author: CommentAuthor
}

interface CommentsResponse {
  slug: string
  issueNumber: number | null
  issueUrl: string | null
  comments: BlogComment[]
  configured: boolean
}

interface MeResponse {
  configured: boolean
  user: { login: string; name: string | null } | null
}

/** Resolves which post's comments to act on: an explicit path, else the current page. */
function resolveCommentKey(args: Record<string, unknown>): { key: string } | { error: string } {
  const path = readString(args, 'path')
  if (path) {
    const key = commentKeyFromPath(path)
    if (!key) {
      return {
        error: `无法从路径「${path}」解析出文章，请使用 /posts/<slug> 或 /leetcode/<slug> 形式。`,
      }
    }
    return { key }
  }

  const { commentKey } = getPageContext()
  if (!commentKey) {
    return { error: '当前页面不是文章页，请用 path 参数指定要操作哪篇文章的评论。' }
  }
  return { key: commentKey }
}

async function fetchMe(): Promise<MeResponse> {
  const res = await fetch(ME_ENDPOINT, { credentials: 'same-origin' })
  if (!res.ok) throw new Error(`登录状态查询失败（HTTP ${res.status}）`)
  return (await res.json()) as MeResponse
}

export const commentTools: ToolDefinition[] = [
  {
    name: 'list-comments',
    description:
      'Read the comments on an article of this site. Defaults to the article currently open; pass '
      + '"path" to read a different one. Comments are backed by GitHub Issues.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description:
            'Optional site path of the article, e.g. "/posts/vue3-contribution". '
            + 'Omit to use the current page.',
        },
      },
    },
    async execute(args) {
      const target = resolveCommentKey(args)
      if ('error' in target) return err(target.error)

      try {
        const res = await fetch(
          `${COMMENTS_ENDPOINT}?slug=${encodeURIComponent(target.key)}`,
          { credentials: 'same-origin' },
        )
        if (!res.ok) return err(`读取评论失败（HTTP ${res.status}）。`)

        const data = (await res.json()) as CommentsResponse
        if (!data.configured) return ok('本站尚未配置评论功能。')
        if (!data.comments.length) return ok(`《${target.key}》还没有评论。`)

        return okJson({
          post: target.key,
          issueUrl: data.issueUrl,
          count: data.comments.length,
          comments: data.comments.map(comment => ({
            author: comment.author.name || comment.author.login,
            login: comment.author.login,
            createdAt: comment.createdAt,
            body: comment.body,
            url: comment.htmlUrl,
          })),
        })
      } catch (error) {
        return err(`读取评论失败：${describeError(error)}`)
      }
    },
  },

  {
    name: 'check-comment-auth',
    description:
      'Check whether the visitor is signed in with GitHub and therefore able to post a comment. '
      + 'Call this before drafting a comment so you can tell the user to sign in first if needed.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      try {
        const me = await fetchMe()
        if (!me.configured) return ok('本站尚未配置评论功能，无法评论。')
        if (!me.user) {
          return okJson({
            signedIn: false,
            hint: '尚未登录。评论区底部有 GitHub 登录入口，登录后即可发表评论。',
          })
        }
        return okJson({ signedIn: true, login: me.user.login, name: me.user.name })
      } catch (error) {
        return err(`查询登录状态失败：${describeError(error)}`)
      }
    },
  },

  {
    name: 'draft-comment',
    description:
      'Write a comment draft into the comment box on the current article and scroll it into view. '
      + 'This does NOT publish anything — the user must review the text and press the submit button '
      + 'themselves. Only works on an article page where a comment section exists.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: `Comment text to place in the box. At most ${MAX_COMMENT_LENGTH} characters.`,
        },
      },
      required: ['text'],
    },
    async execute(args) {
      const root = document.querySelector<HTMLElement>('[data-comments]')
      if (!root) return err('当前页面没有评论区，请先打开一篇文章。')

      const text = readString(args, 'text')
      if (!text) return err('参数 text 不能为空。')
      if (text.length > MAX_COMMENT_LENGTH) {
        return err(`评论过长（${text.length} 字），上限为 ${MAX_COMMENT_LENGTH} 字。`)
      }

      try {
        const me = await fetchMe()
        if (!me.configured) return err('本站尚未配置评论功能，无法评论。')
        if (!me.user) {
          return err('尚未登录 GitHub。请先在评论区点击 GitHub 登录，登录后我再帮你填写草稿。')
        }
      } catch (error) {
        return err(`查询登录状态失败：${describeError(error)}`)
      }

      const input = root.querySelector<HTMLTextAreaElement>('[data-comments-input]')
      if (!input) return err('没有找到评论输入框，评论区可能尚未加载完成。')

      input.value = text
      // Reason: the comment component listens for `input` to drive its own validation
      // and button state — setting `.value` alone would leave the UI out of sync.
      input.dispatchEvent(new Event('input', { bubbles: true }))

      root.scrollIntoView({ behavior: 'smooth', block: 'center' })
      input.focus()

      // NOTE: intentionally no form submission here. See the file header.
      return ok('草稿已填入评论框，并已滚动到评论区。请确认内容无误后，由你点击「发表评论」提交。')
    },
  },
]
