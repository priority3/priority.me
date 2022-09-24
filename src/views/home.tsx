import Header from '../components/header'
import Project from '../components/project'

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
  ]

  return (
    <div>
      {/* <Plum start={start}/> */}
      <Header />
      <div className="fc w-full mt-20 px-3" >
          <div className='fc flex-col gap-7'>
            <div className="!font-700 text-3rem mx-auto ">
              <h1>I'm Priority.</h1>
            </div>
            <div className="w-full border-b-1 border-light-700"></div>
            <div className="leading-8">
              <p>I'm a student now, I am interested in open source, like Front-end and design something cool !</p>
              <p>do something crazy !</p>
              <p>WIP... 🐱‍👓</p>
            </div>
            <div className='static md:flex gap-2' >
                {socialLinks.map(link =>
                  <a key={link.name} href={link.url} >
                    <div className={[link.class, 'linkBtnBase'].join(' ')}>
                        <div className={link.icon} />
                        <span>{link.name}</span>
                    </div>
                  </a>,
                )}
            </div>
            <Project/>
          </div>
      </div>
    </div>
  )
}
