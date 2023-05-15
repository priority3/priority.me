import { Link } from 'react-router-dom'
import { useRouter } from '@/hooks/useRouter'
import type { RouterList } from '@/type'

interface YearsBlogList {
  [key: string]: Array<RouterList>
}

export default function PostsList() {
  const { pageList } = useRouter()
  const yearsBlogList: YearsBlogList = {}

  pageList.forEach((page: RouterList) => {
    const year = page.date?.trim().slice(-4)
    if (year) {
      if (yearsBlogList[year])
        yearsBlogList[year].push(page)

      else
        yearsBlogList[year] = [page]
    }
  })

  return (
      <div className='w-full sm:max-w-max flex flex-col gap-10'>
        {
          Object.keys(yearsBlogList).reverse().map((year) => {
            return (
              <div
                key={year}
                className='w-full flex flex-col gap-5 relative'
              >
                <div
                  className='font-mono text-8em font-bold w-full px-3 absolute opacity-10 top--2rem left--3rem
                  z--1'
                >
                  {year}
                </div>
                <div>
                  {
                    yearsBlogList[year].map((page) => {
                      return (
                        <Link
                          key={page.date}
                          to={page.path ?? '/'}
                          className='block w-full box-hover px-3 py-5'
                        >
                          <div className='w-full fbc'>
                            <h1 className='text-xl max-w-max'>{page.title || 'blog'}</h1>
                            <div className='text-.5em opacity-20 mr-3'>{page.language || ''}</div>
                          </div>
                          <div className='w-full fbc gap-3 md:gap-15 mt-3 text-sm opacity-60'>
                            <span className='over-desc'>{page.desc}</span>
                            <span className='md:min-w-90px'>{page.date?.slice(0, -5)}</span>
                          </div>
                        </Link>
                      )
                    })
                  }
                </div>
              </div>
            )
          })
        }

        {}
      </div>
  )
}
