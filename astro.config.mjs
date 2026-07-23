import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'
import netlify from '@astrojs/netlify'
import { fileURLToPath } from 'node:url'

// Keystatic injects SSR routes (prerender: false). Content pages stay static
// under output:'static' + adapter (Astro hybrid-style).
// https://docs.astro.build/en/guides/integrations-guide/netlify/
export default defineConfig({
  site: 'https://razet.me',
  output: 'static',
  adapter: netlify(),
  trailingSlash: 'never',
  integrations: [react(), keystatic()],
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
    ssr: {
      noExternal: ['@keystatic/core', '@keystatic/astro', '@keystar/ui'],
    },
  },
})
