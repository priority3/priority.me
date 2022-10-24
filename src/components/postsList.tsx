import { Link } from 'react-router-dom'
import { useRouter } from '@/hooks/useRouter'

export default function PostsList() {
  const { pageList } = useRouter()

  return (
      <div className='w-full sm:max-w-max flex flex-col gap-10'>
        {pageList.map((page) => {
          return (
            <Link
              key={page.date}
              className="w-full md:max-w-100 box-hover p3 "
              to={page.path ?? '/'}
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
        })}
      </div>
  )
}
