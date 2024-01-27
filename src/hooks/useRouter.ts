import type { IndexRouteObject, NonIndexRouteObject } from 'react-router-dom'
import { routes } from '@/router'
import type { RouteMeta, RouterList } from '@/type'
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
  const pageRaw = pageRaws.length > 1 ? [...(pageRaws[0].children || []), ...(pageRaws[1].children || [])] : pageRaws[0].children || []
  const pageList: Array<RouterList> = pageRaw.map((page: RoutePageObj) => {
    const { frontmatter } = page.meta!
    const { path } = page

    return {
      ...frontmatter,
      path: `/${routerType}/${path}`,
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
