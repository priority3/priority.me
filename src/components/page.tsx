import type { ReactNode } from 'react'
import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import { useRouter } from '@/hooks'
interface Props {
  attributes: Record<string, any>
  children: ReactNode
}
export const PropsContext = React.createContext<Props | null>(null)
function Page(this: {
  content: React.RefObject<HTMLDivElement>
}, props: Props) {
  // props
  const { children, attributes } = props
  // get page
  const { pageList } = useRouter()
  const curPage = pageList.filter(e => e.title && e.title === attributes.title)[0]

  const titleContent = () => {
    let title, date, subtitle
    if (attributes.title)
      title = <h1>{attributes.display ?? attributes.title }</h1>
      // attributes.date(iso) -> curPage.date(local time)
    if (attributes.subtitle || attributes.desc) {
      subtitle = <p className='opacity-50 !-mt-6 italic'>
        {attributes.subtitle ?? attributes.desc}
      </p>
    }
    if (curPage.date) {
      date = <p className='opacity-60 !-mt-2'>
          {curPage.date}
      </p>
    }

    return (
      <div className='m-auto prose mb-10'>
        {title}
        {subtitle}
        {date}
      </div>
    )
  }

  const navigateTo = () => {
    if (location.hash) {
      document.querySelector(decodeURIComponent(location.hash))
        ?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navigate = useNavigate()
  // handleAnchors

  const content = useRef<HTMLDivElement>(null)
  const handleAnchors = (
    event: MouseEvent & { target: HTMLElement },
  ) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()

      const { pathname, hash } = url

      // if (hash && (!pathname || pathname === location.pathname)) {
      //   window.history.replaceState({}, '', hash)
      //   navigate()
      // }
      // else {
      //   router.push({ path: pathname, hash })
      // }
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigateTo()
      }
      else {
        navigate(`${pathname}#${hash}`)
      }
    }
  }

  useEffect(() => {
    // console.log()
    // useEventListener(window, 'hashchange', navigateTo)
    // useEventListener(content.current!, 'click', handleAnchors)
    window.addEventListener('hashchange', navigateTo)

    content.current!.addEventListener('click', (event) => {
      handleAnchors(event as any)
    })
    navigateTo()
    setTimeout(navigateTo, 500)
  }, [content.current])

  // img gallery
  useEffect(() => {
    let lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery',
      children: 'img',
      pswpModule: () => import('photoswipe'),
    })
    lightbox.init()

    return () => {
      lightbox.destroy()
      lightbox = null
    }
  }, [])

  return (
    <PropsContext.Provider value={props}>

      <div className='px-7 py-10 m-auto'>
        {
          (attributes.display ?? attributes.title)
          && titleContent()
        }
        <article id='gallery' className='pswp-gallery' ref={content}>
          {children}
        </article>
      </div>
    </PropsContext.Provider>
  )
}
export default Page
