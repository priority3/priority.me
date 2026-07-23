# Admin: Keystatic CMS + Umami analytics

## Goal

Add a lightweight authoring path (Keystatic, local) and optional page analytics (Umami) on top of the Astro static site — without a heavy backend (no Mix Space).

## Requirements

1. **Keystatic** (local storage)
   - Collections: `blogs`, `leetcode` aligned with `src/content.config.ts`
   - Admin UI at `/keystatic` during `pnpm dev` only
   - Production remains `output: 'static'`
2. **Umami** (optional)
   - Script injected from `BaseLayout` only when `PUBLIC_UMAMI_SRC` + `PUBLIC_UMAMI_WEBSITE_ID` are set
   - No script / no network call when unset
3. Docs: README + `.env.example`

## Acceptance Criteria

- [ ] `pnpm build` succeeds (static dist)
- [ ] `pnpm dev` serves `/keystatic` admin UI
- [ ] Existing content still renders
- [ ] Umami absent when env empty; present when env set
- [ ] README documents both tools
