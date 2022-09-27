import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'
import { commonShortcuts, projectShortcuts } from './config/unocss'

export default defineConfig({
  shortcuts: [
    {
      ...commonShortcuts,
      ...projectShortcuts,
      'linkBtnBase': `bg-light-200 rounded-md px-3 py-2 text-gray-700 cursor-pointer
      hover:(text-white) transition-all duration-200 fcc gap-2 my-2 md:m0`,
      'border-base': 'border-[#dfe4ea] dark:border-transparent',
      'linkBtnGithub': 'hover:bg-[#3c3c3c]',
      'linkBtnBilibili': 'hover:bg-[#00a1d6]',
      'linkBtnTwitter': 'hover:bg-[#219ff5]',
      'linkBtnBlogPosts': 'hover:bg-[#fd79a8]',
      'box-hover': 'cursor-pointer hover:bg-[#88888808] hover:opacity-100 transition-all duration-300 rounded',
      // post list
      'over-desc': 'block w-[70%] md:max-w-[80%]',
    },
  ],
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
