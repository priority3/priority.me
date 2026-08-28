/**
 * Content tools: let an agent find and read this site's articles without scraping the DOM.
 *
 * Tool descriptions are written in English because they are consumed by the agent's model;
 * user-facing result text stays in Chinese to match the site.
 */

import { readEnum, readInt, readString } from '../args'
import { describeError, err, ok, okJson } from '../result'
import { findPost, searchPosts } from '../search-index'
import type { ToolDefinition } from '../types'

const COLLECTIONS = ['blogs', 'leetcode', 'all'] as const

export const contentTools: ToolDefinition[] = [
  {
    name: 'search-posts',
    description:
      'Search this site\'s articles by keyword. Covers two collections: "blogs" (essays and notes) '
      + 'and "leetcode" (algorithm and TypeScript type-challenge write-ups). Returns ranked matches '
      + 'with title, site path, date and a matching snippet. Call this before navigating so you can '
      + 'pick the right article path.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keywords to search for. Space-separated terms are matched independently.',
        },
        collection: {
          type: 'string',
          enum: ['blogs', 'leetcode', 'all'],
          description: 'Restrict the search to one collection. Defaults to "all".',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results, between 1 and 20. Defaults to 5.',
        },
      },
      required: ['query'],
    },
    async execute(args) {
      const query = readString(args, 'query')
      if (!query) return err('参数 query 不能为空。')

      const collection = readEnum(args, 'collection', COLLECTIONS, 'all')
      const limit = readInt(args, 'limit', { min: 1, max: 20, fallback: 5 })

      try {
        const results = await searchPosts(query, { collection, limit })
        if (!results.length) {
          return ok(
            `没有找到匹配「${query}」的文章。`
            + '可以换个关键词重试，或把 collection 设为 "all" 扩大范围。',
          )
        }
        return okJson({ query, collection, count: results.length, results })
      } catch (error) {
        return err(`搜索索引加载失败：${describeError(error)}`)
      }
    },
  },

  {
    name: 'get-post',
    description:
      'Fetch the full plain-text body and metadata of a single article on this site, for summarising '
      + 'or answering questions about it. Accepts a site path such as "/posts/vue3-contribution" or '
      + '"/leetcode/awaited", or a bare slug. Use search-posts first if you do not know the path.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Site path or slug of the article, e.g. "/posts/vue3-contribution".',
        },
      },
      required: ['path'],
    },
    async execute(args) {
      const path = readString(args, 'path')
      if (!path) return err('参数 path 不能为空。')

      try {
        const post = await findPost(path)
        if (!post) {
          return err(`未找到文章：${path}。可以先用 search-posts 查到正确的路径再试。`)
        }
        return okJson({
          title: post.title,
          href: post.href,
          collection: post.collection,
          date: post.date,
          tag: post.tag,
          desc: post.desc,
          text: post.text,
        })
      } catch (error) {
        return err(`搜索索引加载失败：${describeError(error)}`)
      }
    },
  },
]
