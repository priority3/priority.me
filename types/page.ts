export enum TagType {
  all = 'all',
  leetcode = 'leetcode',
  typehero = 'typehero',
}

export type RouteMeta = Partial<{
  title: string
  author: string
  date: string
  formatDate: string
  desc: string
  language: string
  display: boolean
  lastModifiedTime: string | undefined
  tag?: TagType
}>
export interface RouterList extends RouteMeta {
  path?: string
}
