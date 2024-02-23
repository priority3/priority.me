import { readFileSync, statSync } from 'fs'
import { resolve } from 'path'
import type { ReactRoute } from 'vite-plugin-pages'
import matter from 'gray-matter'
import { formatYMDdate, isDate } from '../utils/date'
import type { RouteMeta } from '#/page'

function getLastModifiedTime(file: string): Date | undefined {
  if (!file.endsWith('.md'))
    return

  const filePath = resolve(process.cwd(), file)

  return statSync(`./${filePath}`).mtime
}

interface MdRoute extends ReactRoute {
  meta?: RouteMeta
}
export const useMdRouter = (mdRoute: MdRoute) => {
  const { element, children, ...others } = mdRoute
  const path = (element && resolve(__dirname, element.slice(1))) || ''
  if (path.includes('blogs') || path.includes('leetcode')) {
    const md = readFileSync(path, 'utf-8')
    const { data } = matter(md)

    // TODO iso-8601 to time
    const date = /.*/.exec(data.date)![0].slice(0, 15)

    const lastModifiedTime = element && getLastModifiedTime(element)
    const newLastfieldTime = lastModifiedTime && formatYMDdate(lastModifiedTime)
    mdRoute.meta = Object.assign(
      mdRoute.meta || {},
      {
        frontmatter: {
          ...data,
          date,
          formatDate: formatYMDdate(data.date),
          lastModifiedTime: newLastfieldTime,
        },
      })
  }

  if (children?.length)
    children.forEach(useMdRouter)

  return { mdRoute }
}

