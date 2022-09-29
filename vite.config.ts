import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'
import fs from 'fs-extra'
import matter from 'gray-matter'
import Pages from 'vite-plugin-pages'
import Markdown from 'vite-plugin-react-markdown'
export default defineConfig({
  plugins: [
    Unocss(),
    react({
      include: [/\.tsx$/, /\.md$/],
    }),
    Pages({
      dirs: [
        { dir: 'src/views', baseRoute: '' },
        { dir: 'pages', baseRoute: 'page' },
      ],
      extensions: ['tsx', 'md'],
      extendRoute(route) {
        if (route.element) {
          const path = resolve(__dirname, route.element.slice(1))
          const md = fs.readFileSync(path, 'utf-8')
          const { data } = matter(md)
          // TODO iso-8601 to time
          const date = /.*/.exec(data.date)[0].slice(0, 15)
          route.meta = Object.assign(route.meta || {}, { frontmatter: { ...data, date } })
        }

        return route
      },
    }),
    Markdown(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

})
