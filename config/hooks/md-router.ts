import { readFileSync, statSync } from 'fs'
import type { ReactRoute } from 'vite-plugin-pages'
import matter from 'gray-matter'
import { getFileCwd } from '../utils'
import { formatYMDdate } from '../utils/date'
import type { RouteMeta } from '#/page'

interface MdRoute extends ReactRoute {
  meta?: RouteMeta
  children?: MdRoute[] | undefined
}
function getLastModifiedTime(file: string): Date | undefined {
  if (!file.endsWith('.md'))
    return

  const filePath = getFileCwd(file)

  return statSync(`./${filePath}`).mtime
}

function getRouteMeta(element?: string, meta?: RouteMeta) {
  const path = (element && getFileCwd(element.slice(1))) || ''
  if (element?.endsWith('.md')) {
    const md = readFileSync(path, 'utf-8')
    const { data } = matter(md)

    // TODO iso-8601 to time
    const date = /.*/.exec(data.date)![0].slice(0, 15)

    const lastModifiedTime = element && getLastModifiedTime(element)
    const newLastfieldTime = lastModifiedTime && formatYMDdate(lastModifiedTime)
    const newMeta = Object.assign(
      meta || {},
      {
        frontmatter: {
          ...data,
          date,
          formatDate: formatYMDdate(data.date),
          lastModifiedTime: newLastfieldTime,
        },
      })

    return newMeta
  }
}

function recursionGetMeta(route?: MdRoute) {
  if (!route) return
  if (route.children) {
    route.children.forEach((child) => {
      child.meta = recursionGetMeta(child)
    })
  }

  return getRouteMeta(route.element, route.meta)
}

export const useMdRouter = (route: MdRoute) => {
  const newMeta = recursionGetMeta(route)
  route.meta = newMeta

  return { mdRoute: route }
}

