import { useRouter } from '@/hooks'
export default function BlogPost() {
  const { pageList } = useRouter()
  const showList = pageList.slice(0, 6).map((item) => {
    return {
      title: item.title,
      formatDate: item.formatDate,
      path: item.path,
    }
  })

  return (
    <div>
      <div className="fbc w-full h-10">
        <h2 className="text-2xl font-600 cursor-pointer">
          <span className="op-40 hover:op-50">#</span >
          <span className='hover:op-90'> Latest Blogs</span>
        </h2>
        <a href="/posts">
          <div className="i-ri-arrow-right-up-line cursor-pointer text-xl hover:text-2xl transition-all duration-300" />
        </a>
      </div>
      <div className='mt-5'>
        {showList.map((item) => {
          return (
            <a key={item.title} className="fbc px-3 py-2 mt-2 mr-2 rounded-md
                transition-colors decoration-none cursor-pointer
             hover:bg-gray-100 dark:hover:bg-gray-50/10
             " href={item.path}>
              <div>
                <h2 className="font-sans text-xl">
                  {item.title}
                </h2>
              </div>
              <div className="font-normal sm:block">
                {item.formatDate}
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
