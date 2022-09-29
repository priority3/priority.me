import PostsList from '@/components/postsList'

export default function Posts() {
  return (
    <div>
      <div className='f-c-c w-full gap-10 mt-20' >
        <h1 className="text-3xl">
          Priority.notes
        </h1>
        <PostsList />
      </div>

    </div>
  )
}
