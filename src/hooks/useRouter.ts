import type { IndexRouteObject, NonIndexRouteObject } from 'react-router-dom'
import { routes } from '@/router'
import type { RouteMeta, RouterList } from '#/page'
import { ROUTERLISTTYPE } from '@/constants/router'

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
export function useRouter(routerType?: `${ROUTERLISTTYPE}`) {
  const pageRaws = routes.filter((page: RoutePageObj) => {
    return routerType ? page.path?.includes(routerType) : (page.path?.includes(ROUTERLISTTYPE.LEETCODEPAGE) || page.path?.includes(ROUTERLISTTYPE.NORMALPAGE))
  })
  const pageRaw: RoutePageObj[] = []
  pageRaws.forEach((page) => {
    const { path: parentPath } = page
    pageRaw.push(...page.children?.map((child: RoutePageObj) => {
      return {
        ...child,
        path: `/${parentPath}/${child.path}`,
      }
    }).filter(Boolean) as RoutePageObj[])
  })
  const pageList: Array<RouterList> = pageRaw?.map((page: RoutePageObj) => {
    const { frontmatter } = page.meta!
    const { path } = page

    return {
      ...frontmatter,
      path,
    }
  })
    .filter(page => page.display ?? true)
    .sort((pre: any, cur: any) => {
      return Date.parse(cur.date) - Date.parse(pre.date)
    })

  return {
    routes,
    pageList,
  }
}
