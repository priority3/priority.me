export default function Project() {
  const projectList = [
    {
      name: 'eslint-config',
      description: 'A shareable eslint config for my projects',
      github: '',
      icon: 'i-logos-eslint',
      text: 'text-#ff6b81',
    },
    {
      name: 'fuzzy',
      description: 'fuzzy ui for vue3 to make easy use components',
      github: '',
      icon: 'i-fluent-emoji-bar-chart',
      text: 'text-#70a1ff',
    },
  ]

  return (
    <div>
      <div className="fi flex-col w-full">
          <div className="fbc w-full h-10">
            <h2 className="text-2xl font-600"><span className="opacity-40">#</span> Recent Projects</h2>
            <a href="https://github.com/priority3">
              <div className="i-fluent-emoji-film-projector cursor-pointer text-2xl hover:text-3xl transition-all duration-200" />
            </a>
          </div>
          <div className="mt-5 w-full md:fbc gap-5 cursor-pointer ">
            {projectList.map((project) => {
              return (

                <div
                  key={project.name}
                  className="p3 fbc gap-2 rounded my-2 md:m0 hover:bg-[#ecf0f1] transition-all duration-200"
                >
                  <div>
                    <h2
                      className={['font-sans text-2xl', project.text].join(' ')}
                    >
                      {project.name}
                    </h2>
                    <span className="opacity-70">desc:</span>
                    <p className="text-sm text-dark-100 opacity-50"> {project.description}</p>
                  </div>
                  <div className={['text-5xl hover:rotate-360 transition-all duration-1500', project.icon].join(' ')} />
                </div>
              )
            })}
          </div>
      </div>
    </div>
  )
}
