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
