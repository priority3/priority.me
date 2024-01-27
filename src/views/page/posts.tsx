import PostsList from './pageComponents/postsList'
import { ROUTERLISTTYPE } from '@/constants/router'
export default function Posts() {
  return (
    <div>
      <div className='f-c-c w-full gap-10 mt-20' >
        <h1 className="text-3xl">
          P.notes
        </h1>
        <PostsList routerType={ROUTERLISTTYPE.NORMALPAGE} />
      </div>

    </div>
  )
}
