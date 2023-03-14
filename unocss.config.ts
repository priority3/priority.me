import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'
import { commonShortcuts, projectShortcuts } from './config'

export default defineConfig({
  theme: {
    breakpoints: {
      sm: '400px',
      md: '640px',
    },
  },
  shortcuts: [
    {
      ...commonShortcuts,
      ...projectShortcuts,
      'linkBtnBase': `bg-light-200 dark:bg-gray-50/10 dark:text-white rounded-md px-3 py-2 text-gray-700 cursor-pointer h-10
      hover:(text-white) transition-all duration-200 fcc gap-2 my-2 md:m0`,
      'border-base': 'border-[#dfe4ea] dark:border-transparent',
      'linkBtnGithub': 'hover:bg-[#3c3c3c]',
      'linkBtnBilibili': 'hover:bg-[#00a1d6]',
      'linkBtnTwitter': 'hover:bg-[#219ff5]',
      'linkBtnBlogPosts': 'hover:bg-[#fd79a8]',
      'linkBtnJuejin': 'hover:bg-[#a7ccfc]',
      'linkBtnLeetcode': 'hover:bg-[#f7b500]',
      'box-hover': 'cursor-pointer hover:bg-[#88888808] hover:opacity-100 transition-all duration-300 rounded',
      // post list
      'over-desc': 'block w-[70%] md:max-w-[80%]',
      'page-container': 'w-full  mt-10 px-10 md:px-0 pb-20',
      'markdown-container': 'w-full md:w-60%',
    },
  ],
  safelist: ['m-auto'],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
})
