import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'
import netlify from '@astrojs/netlify'
import { fileURLToPath } from 'node:url'

/**
 * Resolve Keystatic storage at config-load time (Node).
 * Reason: the Admin UI is a client bundle — bare `process.env` becomes `{}` there,
 * so `keystatic.config.ts` must receive an inlined boolean via Vite `define`.
 */
function keystaticUseGithub() {
  const mode = process.env.KEYSTATIC_STORAGE
  if (mode === 'local') return false
  if (mode === 'github') return true
  return (
    process.env.NETLIFY === 'true'
    || process.env.CONTEXT === 'production'
    || process.env.CONTEXT === 'deploy-preview'
    || process.env.CONTEXT === 'branch-deploy'
  )
}

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
    define: {
      // Inlined into client + SSR so Admin storage matches Netlify/GitHub mode.
      __KEYSTATIC_USE_GITHUB__: JSON.stringify(keystaticUseGithub()),
    },
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
