import PostsList from './pageComponents/postsList'
import { ROUTERLISTTYPE } from '@/constants/router'
export default function Posts() {
  return (
    <div>
      <div className='f-c-c w-full gap-10 mt-20' >
        <h1 className="text-3xl">
          P.Leetcode
        </h1>
        <p>record my leetcode travel</p>
        <PostsList routerType={ROUTERLISTTYPE.LEETCODEPAGE} />
      </div>

    </div>
  )
}
