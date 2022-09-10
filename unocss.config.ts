import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'
import { commonShortcuts } from './config/util'

export default defineConfig({
  shortcuts: [
    {
      ...commonShortcuts,
      linkBtnBase: `bg-light-200 rounded-md px-3 py-2 text-gray-700 cursor-pointer
      hover:(text-white) transition-all duration-200 fcc gap-2`,
      linkBtnGithub: 'hover:bg-[#3c3c3c]',
      linkBtnBilibili: 'hover:bg-[#00a1d6]',
      linkBtnBlogPosts: 'hover:bg-[#fd79a8]',
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
