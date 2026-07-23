# Design · Astro + Yohaku UI

## Architecture

```
src/
├── content/
│   ├── blogs/*.md
│   └── leetcode/*.md
├── content.config.ts          # zod schemas
├── styles/
│   ├── tokens.css             # hand-copied Yohaku tokens
│   ├── global.css
│   └── prose.css
├── layouts/
│   └── BaseLayout.astro
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ThemeToggle.astro      # inline script island
│   ├── SocialLinks.astro
│   ├── PostList.astro
│   ├── ProjectList.astro
│   └── SiteNav.astro
├── lib/
│   ├── posts.ts               # sort / filter helpers
│   └── site.ts                # site meta, social, projects
└── pages/
    ├── index.astro
    ├── posts/index.astro
    ├── posts/[...slug].astro
    ├── leetcode/index.astro
    └── leetcode/[...slug].astro
public/
├── logo.svg
└── _redirects                 # Netlify old→new URLs
```

## Tokens (hand-copied)

From Yohaku CHEATSHEET / tokens.css, simplified for a static site:

| Token | Light | Dark |
|-------|-------|------|
| paper | `#fefefb` | `rgb(28,28,30)` |
| neutral-1…10 | parchment scale | inverted pure gray |
| accent | `#c56473` | slightly lighter `#d67a88` |
| border | `rgba(24,24,27,.1)` | `rgba(255,255,255,.1)` |
| easing | `cubic-bezier(0.22, 1, 0.36, 1)` | same |
| base font | 14px | same |

Type roles: caption-10, label-12, copy-13/14/15, title-20/24/28, display-36.

Fonts:
- sans: system-ui + PingFang SC / Microsoft YaHei
- serif: Source Han Serif / Songti / Georgia
- mono: SF Mono / Menlo / Consolas

## UI map

### Header
- Left: wordmark "P." (serif) or logo
- Center: pill nav — 首页 · 文稿 · Leetcode
- Right: theme toggle circle button
- Sticky, ultrathin blur on scroll optional (v1: solid paper bar)

### Home
- Large vertical whitespace
- Avatar optional (skip if no asset) / name in serif
- Subtitle muted n-7
- Social as circular outline icons
- Sections: 近期笔墨 (latest 5 blogs), 项目 (simple list, not color cards)

### Post list
- Eyebrow "BLOG" / "LEETCODE"
- H1 serif
- Items: title + desc + date mono; hairline dividers; hover bg neutral-2
- Leetcode: optional tag chips (All / leetcode / typehero) via small client script or pure links

### Post detail
- Title serif display
- Meta row (date, language, tag)
- Prose body max-width ~720px
- Back link "← 返回" quiet

## Markdown

Astro built-in markdown + shiki:
- themes: github-light / github-dark (or vitesse if available)
- rehype-external-links for target=_blank
- GFM for task lists
- KaTeX optional later if needed (current MD may not need it)

TOC: support `[[toc]]` via remark-toc or strip and use Astro headings API. Prefer remark plugins.

## Redirects (Netlify `_redirects`)

```
/page/posts          /posts          301
/page/leetcode       /leetcode       301
/blogs/*             /posts/:splat   301
```

## Netlify

```toml
[build]
  publish = "dist"
  command = "pnpm i --frozen-lockfile && pnpm build"

[build.environment]
  NODE_VERSION = "20"
```

No SPA rewrite.

## Risks

| Risk | Mitigation |
|------|------------|
| Markdown plugins diverge from old rendering | Spot-check all 13 posts after build |
| Font FOUT | system stacks first; optional Google fonts later |
| Old absolute links in MD to /blogs/ | redirects cover; optional content rewrite |
