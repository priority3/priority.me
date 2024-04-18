import PostsList from './pageComponents/postsList'
import { RouterListType } from '@/constants/router'
export default function Posts() {
  return (
    <div>
      <div className='f-c-c w-full gap-10 mt-20' >
        <h1 className="text-3xl">
          P.notes
        </h1>
        <PostsList routerType={RouterListType.normalPage} />
      </div>

    </div>
  )
}
