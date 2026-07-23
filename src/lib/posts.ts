import { getCollection, type CollectionEntry } from 'astro:content'
import dayjs from 'dayjs'

export type BlogEntry = CollectionEntry<'blogs'>
export type LeetcodeEntry = CollectionEntry<'leetcode'>
export type PostEntry = BlogEntry | LeetcodeEntry

export function formatDate(date: Date | string, pattern = 'YYYY-MM-DD') {
  return dayjs(date).format(pattern)
}

export function formatDisplayDate(date: Date | string) {
  return dayjs(date).format('YYYY 年 M 月 D 日')
}

function isVisible<T extends PostEntry>(entry: T): boolean {
  return entry.data.display !== false
}

function byDateDesc<T extends PostEntry>(a: T, b: T) {
  return b.data.date.valueOf() - a.data.date.valueOf()
}

export async function getBlogPosts() {
  const posts = await getCollection('blogs', isVisible)
  return posts.sort(byDateDesc)
}

export async function getLeetcodePosts(tag?: 'leetcode' | 'typehero' | 'all') {
  const posts = await getCollection('leetcode', isVisible)
  const sorted = posts.sort(byDateDesc)
  if (!tag || tag === 'all')
    return sorted
  return sorted.filter(p => p.data.tag === tag)
}

export function postHref(collection: 'blogs' | 'leetcode', id: string) {
  const base = collection === 'blogs' ? '/posts' : '/leetcode'
  // Content Layer ids are already slugified (e.g. default-generic-arguments)
  const slug = id.replace(/\.md$/, '')
  return `${base}/${slug}`
}
