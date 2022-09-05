import { Link } from 'react-router-dom'
export default function Header() {
  const socialLinks = [
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

  return (
  <div className='sticky w-full top-0 left-0 p-3 f-c  shadow-warm-gray-500 border-b-gray-2 border-b-2px' >
    <div
      className="
        fbc w-100 md:min-w-200
      "
    >
      <nav>
          <Link to="/">
          <div
            className="text-dark-400 text-5 font-sans cursor-pointer"
          >
            priority
          </div>
          </Link>
      </nav>
      <div
        className='fc gap-3'
      >
        {
          socialLinks.map(link =>
            <a key={link.name} href={link.url}>
              <div
                className={[link.icon, 'text-2xl text-gray-4 hover:text-dark cursor-pointer', 'link-btn'].join(' ')}
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
