import PTypewriter from './icons/p-typewriter'

export default function Project() {
  const projectList = [
    // {
    //   name: 'eslint-config',
    //   description: 'A shareable eslint config for my projects',
    //   github: '',
    //   icon: 'i-logos-eslint',
    // },
    // {
    //   name: 'fuzzy',
    //   description: 'fuzzy ui for vue3 to make easy use components',
    //   github: '',
    //   icon: 'i-fluent-emoji-bar-chart',
    // },
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
              <div className="i-fluent-emoji-film-projector cursor-pointer text-2xl hover:text-3xl transition-all duration-300" />
            </a>
          </div>
          <div className="mt-5 w-full md:fbc flex-wrap gap-5 cursor-pointer ">
            {projectList.map((project) => {
              return (

                <div
                  key={project.name}
                  // TODO
                  className="project-container opacity-60 p3 w-full md:w-40% fbc gap-2 my-2 md:m0 box-hover"
                >
                  <div >
                    <h2
                      className="font-sans text-xl "
                    >
                      {project.name}
                    </h2>
                    <p className="text-sm opacity-50"> {project.description}</p>
                  </div>
                  <div className="icon text-5xl transition-all duration-1500">
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
