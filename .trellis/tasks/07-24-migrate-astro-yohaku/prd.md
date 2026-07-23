# Migrate blog to Astro with Yohaku-inspired UI

## Goal

Replace the Vite + React SPA personal blog with a static Astro site, and restyle the UI after [Yohaku](https://github.com/Innei/Yohaku) design language: paper surface, one accent, three neutral tiers, serif headings, restrained interaction.

## Background

- Current stack: Vite + React 18 + react-router + vite-plugin-pages + custom markdown Vite plugin + UnoCSS.
- Content: Markdown under `pages/blogs/*` and `pages/leetcode/*` with frontmatter.
- Deployed on Netlify as SPA.
- User wants tech migration + UI redesign, tokens hand-copied (not `@yohaku/design-system` npm).

## Requirements

1. **Framework**: Astro 5 + TypeScript, static output (`output: 'static'`).
2. **Content**: Astro Content Collections for `blogs` and `leetcode`; preserve existing frontmatter fields (`title`, `desc`, `date`, `author`, `language`, `display`, `tag`, `subtitle`).
3. **Styling**: Hand-copied Yohaku-inspired `tokens.css` (color scale, paper surface, type roles, easing). Prefer plain CSS / Tailwind-compatible utility classes without UnoCSS dependency.
4. **Pages**:
   - `/` — Hero, social links, recent posts, projects
   - `/posts` — Blog list
   - `/posts/[slug]` — Blog detail
   - `/leetcode` — LeetCode & TypeHero list (optional tag filter)
   - `/leetcode/[slug]` — Detail
5. **URL compatibility**: 301/redirect from old paths (`/page/posts`, `/page/leetcode`, `/blogs/*`) to new paths.
6. **Features to keep**: dark mode (no flash), markdown code highlight, TOC where present, external-link attrs, readable prose.
7. **Features to simplify**: drop framer-motion; drop SPA router; minimal client JS.
8. **Deploy**: Netlify static; Node ≥ 18; remove SPA catch-all rewrite.
9. **Cleanup**: remove obsolete React SPA entry, vite-plugin-pages markdown pipeline, and unused deps after cutover.

## Constraints

- Do not depend on closed-source Yohaku app code; only open design tokens/patterns.
- CJK-friendly fonts; headings use `font-medium`, not synthetic bold on Chinese.
- Keep personal identity (raze / priority) and existing content files.
- Prefer in-repo rewrite over parallel app directory.

## Acceptance Criteria

- [x] `pnpm build` produces a static `dist/` site with no SPA fallback required.
- [x] Home, posts list, leetcode list, and all existing markdown posts render.
- [x] UI follows Yohaku invariants: paper bg, accent ≤ 5%, n1–10 neutrals, serif titles, quiet hover.
- [x] Dark mode toggles and persists; no white flash on load.
- [x] Old URLs redirect to new URLs.
- [x] Netlify config updated for static publish.
- [x] README notes new stack and scripts.

## Notes

- Accent: `#c56473` (light); can soften in dark via CSS vars.
- Hero copy: restrained (*Hi, I'm raze.*) rather than emoji-heavy.
- Interaction strategy: Astro-first, tiny scripts only for theme + optional tag filter.
