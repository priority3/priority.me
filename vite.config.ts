import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'
import fs from 'fs-extra'
import matter from 'gray-matter'
import Pages from 'vite-plugin-pages'
import Markdown from '@pity/vite-plugin-react-markdown'
import Shiki from 'markdown-it-shiki'
import anchor from 'markdown-it-anchor'
import TOC from 'markdown-it-table-of-contents'
import { slugify } from './config'
export default defineConfig({
  plugins: [
    Unocss(),
    react({
      include: [/\.tsx$/, /\.md$/],
    }),
    Pages({
      dirs: [
        { dir: 'src/views', baseRoute: '' },
        { dir: 'pages', baseRoute: '' },
      ],
      extensions: ['tsx', 'md'],
      extendRoute(route) {
        function addMeta(route) {
          const path = resolve(__dirname, route.element.slice(1))
          if (path.includes('blogs')) {
            const md = fs.readFileSync(path, 'utf-8')
            const { data } = matter(md)
            // TODO iso-8601 to time
            const date = /.*/.exec(data.date)![0].slice(0, 15)
            route.meta = Object.assign(route.meta || {}, { frontmatter: { ...data, date } })
          }
        }
        if (route.children?.length)
          route.children.forEach(addMeta)
        else
          addMeta(route)

        return route
      },
    }),
    Markdown({
      wrapperClasses: 'prose m-auto',
      wrapperComponentName: 'ReactMarkdown',
      wrapperComponentPath: './src/components/page',
      markdownItSetup(md) {
        md.use(Shiki, {
          theme: {
            light: 'vitesse-light',
            dark: 'vitesse-dark',
          },
        })
        md.use(anchor, {
          slugify,
          permalink: anchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({ 'aria-hidden': 'true' }),
          }),
        })

        md.use(TOC, {
          includeLevel: [1, 2, 3],
          slugify,
        })
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

})
