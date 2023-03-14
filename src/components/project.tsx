import PTypewriter from './icons/p-typewriter'
import PLeetcode from './icons/p-leetcode'
export default function Project() {
  const projectList = [
    {
      name: 'vite-plugin-react-markdown',
      description: 'use mardown in react & vite',
      github: 'https://github.com/priority3/vite-plugin-react-markdown',
      icon: 'i-teenyicons-markdown-outline',
    },
    {
      name: 'leetcode-daily',
      description: 'daily algorithm is used in TS/Python/Rust',
      github: 'https://github.com/priority3/rookie-Algorithm',
      icon: 'p-leetcode',
    },
    {
      name: 'p-typewriter',
      description: 'typewriter component for vue3',
      github: 'https://github.com/priority3/p-typewriter',
      icon: 'p-typewriter',
    },

  ]

  function getProjectIcon(name: string) {
    switch (name) {
      case 'p-typewriter':
        return (
          <PTypewriter />
        )
      case 'p-leetcode':
        return (
          <PLeetcode />
        )
      default:
        return (
          <div className={name}></div>
        )
    }
  }

  return (
    <div>
      <div className="fi flex-col w-full">
          <div className="fbc w-full h-10">
            <h2 className="text-2xl font-600 cursor-pointer"><span className="op-40 hover:op-50">#</span > <span className='hover:op-90'>Recent Projects</span></h2>
            <a href="https://github.com/priority3">
              <div className="i-ri-arrow-right-up-line cursor-pointer text-xl hover:text-2xl transition-all duration-300" />
            </a>
          </div>
          <div className="mt-5 w-full md:fbc flex-wrap cursor-pointer gap-5">
            {projectList.map((project) => {
              return (
                <a
                  key={project.name}
                  href={project.github}
                  // TODO
                  className="p3 w-full md:w-44% fbc gap-2 my-2 md:m0 box-hover dark:bg-gray-50/10 hover:dark:bg-gray-50/20"
                >
                  <div >
                    <h2
                      className="font-sans text-xl"
                    >
                      {project.name}
                    </h2>
                    <p className="text-sm opacity-50"> {project.description}</p>
                  </div>
                  <div className="text-5xl text-center transition-all duration-1500">
                    {getProjectIcon(project.icon)}
                  </div>
                </a>
              )
            })}
          </div>
      </div>
    </div>
  )
}
