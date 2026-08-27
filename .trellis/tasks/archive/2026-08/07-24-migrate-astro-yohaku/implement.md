# Implement · Astro + Yohaku UI

## Phase order

### 1. Scaffold (replace package surface)

- [x] Create `astro.config.mjs`, new `tsconfig.json`, `src/env.d.ts`
- [x] Rewrite `package.json` scripts/deps for Astro
- [x] Add `src/styles/tokens.css`, `global.css`, `prose.css`
- [x] Update `netlify.toml` + `public/_redirects`
- [x] Move MD: `pages/blogs` → `src/content/blogs`, `pages/leetcode` → `src/content/leetcode`
- [x] `src/content.config.ts` schemas
- [x] Remove / stop using old Vite React entry (delete after pages work)

### 2. Layout shell

- [x] `BaseLayout.astro` (meta, theme FOUC script, styles)
- [x] `Header.astro` + `Footer.astro` + `ThemeToggle.astro`
- [x] `src/lib/site.ts` (social, projects, site meta)

### 3. Pages

- [x] `index.astro` home
- [x] `posts/index.astro` + `[...slug].astro`
- [x] `leetcode/index.astro` + `[...slug].astro`
- [x] `lib/posts.ts` helpers

### 4. Polish & cutover

- [x] Prose + shiki dark/light
- [x] Verify redirects
- [x] `pnpm build` green
- [x] Delete obsolete `src/views`, old router, vite config plugins, UnoCSS if unused
- [x] Update README
- [x] TableOfContents from headings; strip legacy `[[toc]]`

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## Out of scope (this task)

- Comments, search, RSS (can follow-up)
- KaTeX unless a post breaks
- PhotoSwipe gallery (plain images first)
- Full Yohaku closed-source features (notes/timeline/thinking)
