# Keystatic Admin Customization

> How this project's customized Keystatic admin (razet.me/keystatic) is wired, and the contracts/pitfalls when touching it. Facts verified 2026-07-30 (task `07-30-keystatic-ux-fixes`).

---

## Architecture

| Piece | File | Role |
|-------|------|------|
| Custom shell | `src/pages/keystatic/[...params].astro` | Replaces stock blank page; boot loading overlay (`#priority-ks-boot`) while the ~2.8MB admin bundle hydrates |
| Theme | `src/styles/keystatic-theme.css` | ~750-line override sheet for Keystatic internals |
| Theme injection | `src/keystatic/ensure-theme.ts` | Side-effect import in `keystatic.config.ts`; inlines the CSS (`?inline`) into `<style id="priority-keystatic-theme">` kept **last in `<head>`** — this is why unprefixed rules with modest specificity still win over emotion styles |
| Draft workflow | `src/keystatic/draft-workflow.ts` | Injects the 保存草稿/发布 toolbar; drives the `keystatic/drafts` branch save/publish flow |

The `.astro` shell does NOT load the theme — `ensure-theme.ts` does. CSS changes must land in `keystatic-theme.css` to reach the deployed admin.

## Selector Conventions (theme CSS)

- Use Keystatic/Keystar **data attributes, aria attributes, role, and structural selectors** — e.g. `[data-keystatic-editor]`, `[data-scrollable]`, `.kui-scheme--*`, `main[id]`, `:has(...)`.
- Never target hashed emotion classes (`.css-*`) — they change across builds/versions.
- `:has()` is already relied on throughout the sheet; fine to use.

## Toolbar Host Contract (draft-workflow.ts)

`findHeaderActionsHost()` resolution order: native Save button's parent → `#page-title` parent → `main[id] > header` → `null`. An 800ms interval re-runs `ensureToolbar()`, so returning `null` self-heals once the header exists.

### Common Mistake: generic-container fallback

**Symptom**: toolbar rendered mid-page in a horizontal row next to the loading spinner on item pages.

**Cause**: the fallback used to be `main.querySelector(':scope > div')`. During the item Suspense fallback, the first div child of `<main>` is the centered loading Flex (`ProgressCircle aria-label="Loading Item"`) — Keystatic's real `PageHeader` is a `<header>`, not a div.

**Prevention**: host fallbacks must match semantic elements (`header`) and prefer returning `null` over guessing; the retry interval will attach later.

## Editor Scroll Anatomy

- Scroll container: `div[data-scrollable]` (Keystar ScrollView) inside `SplitPaneSecondary`; the ProseMirror content is `[data-keystatic-editor='content']` under `[data-keystatic-editor='root'][data-layout='main']`.
- Keystatic ships only 32px bottom padding on the content → caret glued to viewport bottom. Fixed with `padding-bottom: 33vh !important` on the content element (only `padding-bottom` — emotion sets the `padding` shorthand) + `scroll-padding-bottom` on the scroll container.

> **Warning**: `prosemirror-view` computes its own `scrollTop` for typing/Enter scrolls with a default 5px `scrollMargin` and **ignores CSS `scroll-padding`**. Those are EditorView props Keystatic doesn't expose — CSS can only add breathing room via content padding, not change the scroll target offset.

- Scope editor rules with `[data-layout='main']` so bordered inline sub-editors aren't inflated.

## Version-Fragility Notes

- English aria-label literals (e.g. `"Loading Item"`) and DOM structure assumptions can drift on Keystatic upgrades — re-verify `draft-workflow.ts` DOM queries and structural theme selectors after bumping `@keystatic/*`.
- Known baseline noise: 2 `[router]` collision warnings for `/keystatic/[...params]` at build, 1 pre-existing `ts(7016)` in the shell (`astro check`), vite chunk-size notice for the admin bundle.
