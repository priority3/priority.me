/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Umami script URL, e.g. https://cloud.umami.is/script.js */
  readonly PUBLIC_UMAMI_SRC?: string
  /** Umami website id from the dashboard */
  readonly PUBLIC_UMAMI_WEBSITE_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
