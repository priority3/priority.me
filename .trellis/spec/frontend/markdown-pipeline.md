# Markdown Pipeline (math, mermaid, code highlighting)

> How markdown content is rendered in this project, and the ordering contracts that make it work. All facts below were build-verified on 2026-07-30 (task `07-30-math-code-block`).

---

## Pipeline Contract (astro.config.mjs)

```js
markdown: {
  remarkPlugins: [remarkGfm, remarkGithubAlerts, remarkMath, remarkMermaid],
  // rehype-raw: allow remarkMermaid HTML; katex after raw
  rehypePlugins: [rehypeRaw, rehypeKatex],
  // Shiki skips `math` fences so rehype-katex receives `language-math` blocks
  syntaxHighlight: { type: 'shiki', excludeLangs: ['math'] },
  shikiConfig: { /* dual themes vitesse-light/dark, wrap, transformers */ },
}
```

Execution order: remark plugins → Astro built-in Shiki highlighting → remark-rehype → user rehype plugins (`rehypeRaw` → `rehypeKatex`).

**Ordering rules (do not break):**

1. `rehypeRaw` must run **before** `rehypeKatex` — remarkMermaid emits raw HTML nodes that must be parsed first.
2. `remarkMermaid` converts ` ```mermaid ` code nodes to HTML **at remark stage**, i.e. before Shiki ever sees them. Mermaid therefore does NOT need `excludeLangs`; do not add it there.
3. ` ```math ` fences rely on `excludeLangs: ['math']`: without it, Shiki consumes the code block and replaces the `language-math` class before rehype-katex (v7 natively handles `language-math` / `math-inline` / `math-display` classes) can render it.
4. `syntaxHighlight` and `shikiConfig` are **sibling** fields; changing one does not affect the other.

---

## Supported Math Syntax (content authors)

| Syntax | Result | Notes |
|--------|--------|-------|
| `$E=mc^2$` | inline math | single dollars, same paragraph |
| `$$` … `$$` (own lines) | display math | blank lines inside the fence are allowed |
| ` ```math ` fence | display math | best option for multi-line formulas, esp. from Keystatic |
| `\( … \)` / `\[ … \]` | **not supported** | remark-math ignores them; backslashes get eaten as markdown escapes |
| `\$` | literal dollar sign | e.g. prices |

KaTeX CSS is imported globally in `src/layouts/BaseLayout.astro`; `.katex-display` styles live in `src/styles/prose.css`.

---

## Gotchas: Keystatic Admin + Math

> **Warning**: The Keystatic admin editor never renders KaTeX. Formulas only render on the built site after publish + Netlify deploy. Raw text in the editor is expected, not a failure.

- **Hard-break pollution**: multi-line text pasted (or Shift+Enter) into a Keystatic paragraph is serialized with trailing `\` per line. A `$$ … $$` block written this way ships a stray `\` into the formula → `KaTeX ParseError` (red error text) on the site. Build-verified.
  - **Wrong**: one paragraph containing `$$` ⏎ formula ⏎ `$$` (soft breaks).
  - **Correct**: either three separate paragraphs (plain Enter each line), or — preferred — a **code block with language `math`** (code block content is saved literally, immune to hard-break serialization).
- Markdoc's formatter does NOT escape `$`, `\`, `_` in text nodes (tested with `Markdoc.format`), so inline `$x_1$` typed in the editor survives to the `.md` file intact.

---

## Verification Recipe

When touching this pipeline, verify with a temp post in `src/content/blogs/` containing a ` ```math ` fence, inline `$…$`, a `$$…$$` block, a ` ```python ` fence, and a ` ```mermaid ` fence, then `pnpm astro build` and assert on its `dist/posts/<slug>/index.html`:

- `katex-display` ≥ 2 and `katex-error` = 0; no leftover `language-math` class
- python fence still emits `astro-code astro-code-themes vitesse-light vitesse-dark`
- mermaid fence emits `mermaid-wrap` (not code, not katex)
- delete the temp post and rebuild (dist is gitignored but keep it consistent)

Known pre-existing noise (not regressions): `[router]` keystatic route-collision warnings, vite chunk-size notice for the Keystatic admin bundle, and one `ts(7016)` error in `src/pages/keystatic/[...params].astro` from `astro check`.
