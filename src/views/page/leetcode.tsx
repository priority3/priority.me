import PostsList from './pageComponents/postsList'
import { RouterListType } from '@/constants/router'
export default function Posts() {
  return (
    <>
      <div className='f-c-c w-full gap-10 mt-20' >
        <h1 className="text-3xl">
          P.Leetcode & typehero
        </h1>
        <p>record my <a className='a-border' href="https://leetcode.com/priority3/">leetcode</a> & <a className='a-border' href="https://typehero.dev/@priority3">typehero</a> travel</p>
        <PostsList routerType={RouterListType.LeetcodePage} />
      </div>
    </>
  )
}
