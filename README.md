## [Priority.me](https://priority-me.netlify.app/)

> recording ...

Personal site of **raze** — notes, projects, and leetcode.

### Stack

- [Astro](https://astro.build) (static)
- Hand-copied [Yohaku](https://github.com/Innei/Yohaku)-inspired design tokens
- Markdown Content Collections
- [Keystatic](https://keystatic.com) (local CMS, dev only)
- [Umami](https://umami.is) (optional analytics)

### Scripts

```bash
pnpm install
pnpm dev      # local dev + Keystatic at /keystatic
pnpm build    # static build → dist/
pnpm preview  # preview production build
```

### Content

- `src/content/blogs/` — posts
- `src/content/leetcode/` — leetcode & typehero notes

**Write in the browser (local dev only):**

```bash
pnpm dev
# open http://localhost:4321/keystatic
```

Save writes Markdown under `src/content/*`. Then `git commit` + push; Netlify rebuilds the site.

> Keystatic Admin is **not** included in production builds (`output: 'static'`). Use it locally to author content.

**Or edit files directly** with frontmatter:

```md
---
title: Hello
date: 2026-07-24
desc: optional summary
author: priority
language: CN
display: true
---
```

### Analytics (Umami)

Optional. Copy `.env.example` → `.env` (local) or set Netlify env:

```bash
PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js
PUBLIC_UMAMI_WEBSITE_ID=<your-website-id>
```

When either var is empty, no script is injected.

<samp>code is licensed under <a href='./LICENSE'>MIT</a>,<br> words and images are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/'>CC BY-NC-SA 4.0</a></samp>.
