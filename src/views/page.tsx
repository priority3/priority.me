import remarkGfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '@/style/markdown.scss'

export default function Page() {
  const location = useLocation()
  const [page, setPage] = useState('')
  const [content, setContent] = useState('')
  useEffect(() => {
    setPage(location.search.split('=')[1] || '')
  }, [location])

  useEffect(() => {
    if (page) {
      fetch(`/pages/${page}.md`).then((res) => {
        res.text().then((text) => {
          setContent(text.replace(/^-{3}(.|\n|\t)*-{3}/, ''))
        })
      })
    }
  }, [page])

  return (
    <div className='page-container'>
      <div className='markdown-container'>
        <ReactMarkdown children={content} remarkPlugins={[remarkGfm]}/>
      </div>
    </div>
  )
}
