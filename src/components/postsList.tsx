import { routes } from '@/router'
import type { RouteMeta } from '@/type'
export default function PostsList() {
  const pageRaw = routes.filter((page: { path: string }) => page.path === 'page')
  const pageList = (pageRaw[0].children || []).map((page: { meta: { frontmatter: RouteMeta } }) => {
    const { frontmatter } = page.meta

    return {
      ...frontmatter,
    }
  }).sort((pre: any, cur: any) => {
    return Date.parse(cur.date) - Date.parse(pre.date)
  })

  return (
      <div className='flex flex-col gap-10'>
        {pageList.map((page: RouteMeta) => {
          return (
            <div
              key={page.date}
              className="w-full md:max-w-100 box-hover p3 "
            >
              <h1 className='text-xl'>{page.title || 'blog'}</h1>
              <div className='w-full fbc gap-3 md:gap-15 mt-1 text-sm opacity-60'>
                <span className='over-desc'>{page.desc}</span>
                <span className='md:min-w-90px '>{page.date?.slice(0, -5)}</span>
              </div>
            </div>
          )
        })}
      </div>
  )
}
