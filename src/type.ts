import type { ROUTERLISTTYPE } from './constants/router'

export type RouteMeta = Partial<{
  title: string
  author: string
  date: string
  formatDate: string
  desc: string
  language: string
  display: boolean
}>

export interface RouterList extends RouteMeta {
  path: string
}

export interface RouterTypeListProps {
  routerType: `${ROUTERLISTTYPE}`
}
