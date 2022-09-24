import PTypewriter from './icons/p-typewriter'

export default function Project() {
  const projectList = [
    {
      name: 'eslint-config',
      description: 'A shareable eslint config for my projects',
      github: '',
      icon: 'i-logos-eslint',
    },
    {
      name: 'fuzzy',
      description: 'fuzzy ui for vue3 to make easy use components',
      github: '',
      icon: 'i-fluent-emoji-bar-chart',
    },
    {
      name: 'p-typewriter',
      description: 'typewriter component for vue3',
      github: '',
      icon: 'p-typewriter',
    },
  ]

  function getProjectIcon(name: string) {
    switch (name) {
      case 'p-typewriter':
        return (
          <PTypewriter />
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
            <h2 className="text-2xl font-600"><span className="opacity-40">#</span> Recent Projects</h2>
            <a href="https://github.com/priority3">
              <div className="i-fluent-emoji-film-projector cursor-pointer text-2xl hover:text-3xl transition-all duration-200" />
            </a>
          </div>
          <div className="mt-5 w-full md:fbc flex-wrap gap-5 cursor-pointer ">
            {projectList.map((project) => {
              return (

                <div
                  key={project.name}
                  className="p3 w-full md:w-40% fbc gap-2 rounded my-2 md:m0 hover:bg-[#ecf0f1] transition-all duration-200"
                >
                  <div >
                    <h2
                      className="font-sans text-dark-200 text-xl opacity-80"
                    >
                      {project.name}
                    </h2>
                    <p className="text-sm text-dark-100 opacity-50"> {project.description}</p>
                  </div>
                  <div className="opacity-50 text-5xl hover:rotate-360 hover:opacity-100 transition-all duration-1500">
                    {getProjectIcon(project.icon)}
                  </div>
                </div>
              )
            })}
          </div>
      </div>
    </div>
  )
}
