/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Umami script URL, e.g. https://cloud.umami.is/script.js */
  readonly PUBLIC_UMAMI_SRC?: string
  /** Umami website id from the dashboard */
  readonly PUBLIC_UMAMI_WEBSITE_ID?: string
  /** Keystatic GitHub App slug (public) */
  readonly PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Server-only env (Netlify Functions / Node) — documented for editors
// KEYSTATIC_GITHUB_CLIENT_ID
// KEYSTATIC_GITHUB_CLIENT_SECRET
// KEYSTATIC_SECRET
// KEYSTATIC_STORAGE — local|github; also inlined for Admin via Vite define
// PRESENCE_TOKEN — shared secret for ProcessReporter MixSpace destination

/** Inlined by Vite in astro.config.mjs (client + SSR Keystatic bundles). */
declare const __KEYSTATIC_USE_GITHUB__: boolean

declare module '*.css?inline' {
  const css: string
  export default css
}
