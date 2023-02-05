import type { IndexRouteObject, NonIndexRouteObject } from 'react-router-dom'
import { routes } from '@/router'
import type { RouteMeta } from '@/type'
interface IndexRoutePageObj extends IndexRouteObject {
  meta?: {
    frontmatter: RouteMeta
  }
}
interface NonIndexRoutePageObj extends NonIndexRouteObject {
  meta?: {
    frontmatter: RouteMeta
  }
}

type RoutePageObj = IndexRoutePageObj | NonIndexRoutePageObj
export function useRouter() {
  const pageRaw = routes.filter((page: RoutePageObj) => {
    return page.path?.includes('blogs')
  })
  const pageList = (pageRaw[0].children || []).map((page: RoutePageObj) => {
    const { frontmatter } = page.meta!
    const { path } = page

    return {
      ...frontmatter,
      path: `/blogs/${path}`,
    }
  }).sort((pre: any, cur: any) => {
    return Date.parse(cur.date) - Date.parse(pre.date)
  })

  return {
    routes,
    pageList,
  }
}
