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
// KEYSTATIC_STORAGE
// PRESENCE_TOKEN — shared secret for ProcessReporter MixSpace destination
