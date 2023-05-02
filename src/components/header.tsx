import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDark } from '@/hooks/useDark'
import './style/header.scss'
export default function Header() {
  const { toggleTheme } = useDark()
  const [postProfile, setPostProfile] = useState({
    name: 'BlogPosts',
    url: '/posts',
    icon: 'i-carbon-blog',
  })
  const socialLinks = [
    postProfile,
    {
      name: 'GitHub',
      url: 'https://github.com/priority3',
      icon: 'i-carbon-logo-github',
    },
    {
      name: 'Bilibili',
      url: 'https://space.bilibili.com/94544300',
      icon: 'i-carbon-screen',
    },
  ]
  const location = useLocation()

  useEffect(() => {
    setPostProfile({
      name: location.pathname === '/' ? 'BlogPosts' : 'Profile',
      url: location.pathname === '/' ? '/posts' : '/',
      icon: location.pathname === '/' ? 'i-carbon-blog' : 'i-carbon-home',
    })
  }, [location])

  return (
  <div
    className='header-container w-full top-0 left-0 p-3 f-c shadow-warm-gray-500 border-base sticky' >
    <div
      className="fbc w-full md:px-10"
    >
      <nav>
          <Link to="/">
            <div className='fcc gap-2'>
              <div className='i-fluent-emoji-rolling-on-the-floor-laughing'></div>
              <div
                className="op-50 text-5 font-sans cursor-pointer"
              >
                P.
              </div>
            </div>
          </Link>
      </nav>
      <div
        className='fcc gap-3'
      >
        {
          socialLinks.map(link =>
            <a key={link.name} href={link.url} title={link.name}>
              <div
                className={[link.icon, 'text-xl op-60 cursor-pointer hover:op-100'].join(' ')}
              >
              </div>
            </a>,
          )
        }
        <div
          className="i-carbon:moon dark:i-carbon:sun op-50 text-xl op-40 hover:op-100 cursor-pointer"
          onClick={toggleTheme}
        />

      </div>
    </div>
  </div>
  )
}
