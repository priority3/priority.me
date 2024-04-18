import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'
import type { ReactRoute } from 'vite-plugin-pages'
import Pages from 'vite-plugin-pages'
import Markdown from '@pity/vite-plugin-react-markdown'
import Shiki from 'markdown-it-shiki'
import anchor from 'markdown-it-anchor'
import TOC from 'markdown-it-table-of-contents'
import LinkAttributes from 'markdown-it-link-attributes'
import Katex from 'markdown-it-katex'
import TaskList from 'markdown-it-task-lists'
// import { imgLazyload } from '@mdit/plugin-img-lazyload'
import { attrs } from '@mdit/plugin-attrs'
import { slugify, useMdRouter } from './config'
export default defineConfig({
  plugins: [
    Unocss(),
    react(),
    Pages({
      exclude: [
        'src/views/page/pageComponents/*.tsx',
      ],
      dirs: [
        { dir: 'src/views', baseRoute: '' },
        { dir: 'pages', baseRoute: '' },
      ],
      extensions: ['tsx', 'md'],
      extendRoute(route: ReactRoute) {
        const { mdRoute } = useMdRouter(route)

        return mdRoute
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

        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })

        md.use(TOC, {
          includeLevel: [1, 2, 3],
          slugify,
        })

        md.use(Katex)
        md.use(TaskList)
        md.use(attrs)
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '#': resolve(__dirname, 'types'),
    },
  },

})
