import type { RouteObject } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/router'
import type { RouteMeta } from '@/type'

interface RoutePageObj extends RouteObject {
  meta?: {
    frontmatter: RouteMeta
  }
}

export default function PostsList() {
  const navigate = useNavigate()
  const pageRaw = routes.filter((page: RoutePageObj) => page.path === 'page')
  const pageList = (pageRaw[0].children || []).map((page: RoutePageObj) => {
    const { frontmatter } = page.meta!
    const { path } = page

    return {
      ...frontmatter,
      path,
    }
  }).sort((pre: any, cur: any) => {
    return Date.parse(cur.date) - Date.parse(pre.date)
  })

  return (
      <div className='flex flex-col gap-10'>
        {pageList.map((page) => {
          return (
            <div
              key={page.date}
              className="w-full md:max-w-100 box-hover p3 "
              onClick={() => navigate(`/page?profile=${page.path}`)}
            >
              <h1 className='text-xl'>{page.title || 'blog'}</h1>
              <div className='w-full fbc gap-3 md:gap-15 mt-3 text-sm opacity-60'>
                <span className='over-desc'>{page.desc}</span>
                <span className='md:min-w-90px '>{page.date?.slice(0, -5)}</span>
              </div>
            </div>
          )
        })}
      </div>
  )
}
