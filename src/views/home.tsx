import Project from '../components/project'
import Juejin from '@/components/icons/juejin'
export default function Home() {
  const socialLinks = [
    {
      name: 'Bilibili',
      url: 'https://space.bilibili.com/94544300',
      icon: 'i-ri-bilibili-fill',
      class: 'linkBtnBilibili',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/priority3',
      icon: 'i-ri-github-fill',
      class: 'linkBtnGithub',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/prioriycc',
      icon: 'i-ri-twitter-fill',
      class: 'linkBtnTwitter',
    },
    {
      name: 'BlogPosts',
      url: '/posts',
      icon: 'i-fluent-emoji-bookmark-tabs',
      class: 'linkBtnBlogPosts',
    },
    {
      url: 'https://juejin.cn/user/3466114142048472/posts',
      icon: 'i-juejin',
      class: 'linkBtnJuejin',
    },
  ]

  function getSocialLinkIcon(icon: string) {
    switch (icon) {
      case 'i-juejin':
        return (
          <Juejin />
        )
      default:
        return (
          <div className={icon}></div>
        )
    }
  }

  return (
      <div className="fc w-full mt-30 px-3" >
        <div className='fc flex-col gap-7'>
          <div className="!font-700 text-3rem mx-auto ">
            <h1>hey 🤣, I'm Priority.</h1>
          </div>
          <div className="w-full border-b-1 border-base" ></div>
          <div className="leading-8">
            <p>I'm a student, 21 years old now, I am interested in open source, like Front-end and design something cool ! </p>
            <p>do something crazy !</p>
            <p>WIP... 🐱‍👓</p>
          </div>
          <div className='static md:flex gap-2' >
              {socialLinks.map(link =>
                <a key={link.icon} href={link.url} >
                  <div className={[link.class, 'linkBtnBase'].join(' ')}>
                      {getSocialLinkIcon(link.icon)}
                      {link.name && <span>{link.name}</span>}
                  </div>
                </a>,
              )}
          </div>
          <Project/>
        </div>
    </div>
  )
}
