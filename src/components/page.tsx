import type { ReactNode } from 'react'
import React from 'react'
import { useRouter } from '@/hooks/useRouter'
interface Props {
  attributes: Record<string, any>
  children: ReactNode
}
export const PropsContext = React.createContext<Props | null>(null)
function Page(props: Props) {
  const { children, attributes } = props
  const { pageList } = useRouter()
  const curPage = pageList.filter(e => e.title && e.title === attributes.title)[0]
  const titleContent = () => {
    let title, date, subtitle
    if (attributes.title)
      title = <h1>{attributes.display ?? attributes.title }</h1>
    if (attributes.date) {
      date = <p className='opacity-50 !-mt-2'>
        {curPage.date}
      </p>
      if (attributes.subtitle || attributes.desc) {
        subtitle = <p className='opacity-50 !-mt-6 italic'>
          {attributes.subtitle ?? attributes.desc}
        </p>
      }
    }

    return (
      <div className='m-auto prose mb-10'>
        {title}
        {date}
        {subtitle}
      </div>
    )
  }

  return (
    <PropsContext.Provider value={props}>

      <div className='px-7 py-10 m-auto'>
        {
          (attributes.display ?? attributes.title)
          && titleContent()
        }
        <article>
          {children}
        </article>
        </div>
    </PropsContext.Provider>
  )
}
export default Page
