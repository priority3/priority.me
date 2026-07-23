## [Priority.me](https://priority-me.netlify.app/)

> recording ...

Personal site of **raze** — notes, projects, and leetcode.

### Stack

- [Astro](https://astro.build) (static)
- Hand-copied [Yohaku](https://github.com/Innei/Yohaku)-inspired design tokens
- Markdown Content Collections

### Scripts

```bash
pnpm install
pnpm dev      # local dev
pnpm build    # static build → dist/
pnpm preview  # preview production build
```

### Content

- `src/content/blogs/` — posts
- `src/content/leetcode/` — leetcode & typehero notes

Add a new Markdown file with frontmatter:

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

<samp>code is licensed under <a href='./LICENSE'>MIT</a>,<br> words and images are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/'>CC BY-NC-SA 4.0</a></samp>.
