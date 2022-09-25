import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
export default function Header() {
  const postProfileNameMap = {
    '/': 'BlogPosts',
    '/posts': 'Profile',
  }
  const postProfileUrlMap = {
    '/': '/posts',
    '/posts': '/',
  }
  const postProfileIconMap = {
    '/': 'i-arcticons-blogger',
    '/posts': 'i-arcticons-valkyrieprofile',
  }

  const [postProfile, setPostProfile] = useState({
    name: 'BlogPosts',
    url: '/posts',
    icon: 'i-arcticons-blogger',
  })
  const socialLinks = [
    postProfile,
    {
      name: 'GitHub',
      url: 'https://github.com/priority3',
      icon: 'i-arcticons-github',
    },
    {
      name: 'Bilibili',
      url: 'https://space.bilibili.com/94544300',
      icon: 'i-arcticons-bilibili',
    },
  ]
  const location = useLocation()

  useEffect(() => {
    setPostProfile({
      name: postProfileNameMap[location.pathname as keyof typeof postProfileNameMap],
      url: postProfileUrlMap[location.pathname as keyof typeof postProfileUrlMap],
      icon: postProfileIconMap[location.pathname as keyof typeof postProfileIconMap],
    })
  }, [location])

  return (
  <div className='w-full top-0 left-0 p-3 f-c  shadow-warm-gray-500 border-b-gray-2 border-b-2px' >
    <div
      className="fbc w-full px-10"
    >
      <nav>
          <Link to="/">
            <div className='fcc gap-2'>
              <div className='i-fluent-emoji-rolling-on-the-floor-laughing'></div>
              <div
                className="text-dark-400 text-5 font-sans cursor-pointer"
              >
                priority
              </div>
            </div>
          </Link>
      </nav>
      <div
        className='fc gap-3'
      >
        {
          socialLinks.map(link =>
            <a key={link.name} href={link.url} title={link.name}>
              <div
                className={[link.icon, 'text-2xl text-gray-4 cursor-pointer hover:text-dark'].join(' ')}
              >
              </div>
            </a>,
          )
        }
      </div>
    </div>
  </div>
  )
}
