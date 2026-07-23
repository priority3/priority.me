import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  site: 'https://priority-me.netlify.app',
  output: 'static',
  trailingSlash: 'never',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
      defaultColor: false,
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
