import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'
import { fileURLToPath } from 'node:url'

// Keystatic injects SSR routes (`prerender: false`). Enable only for `astro dev`
// so production stays pure static on Netlify.
const enableKeystatic = process.argv.includes('dev')

// https://astro.build/config
export default defineConfig({
  site: 'https://priority-me.netlify.app',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    ...(enableKeystatic ? [react(), keystatic()] : []),
  ],
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
    // Do NOT include bare '@keystar/ui' — package has no "." export (subpaths only).
    // Direct deps + pnpm hoist make @keystar/ui/* resolvable for Keystatic islands.
    ssr: {
      noExternal: ['@keystatic/core', '@keystatic/astro', '@keystar/ui'],
    },
  },
})
