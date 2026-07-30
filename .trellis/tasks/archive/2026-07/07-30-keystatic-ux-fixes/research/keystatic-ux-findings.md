# Research: Keystatic Admin UX bugs — item-page loading row + editor caret glued to bottom

- **Query**: Diagnose (1) spinner + 保存草稿/发布 buttons collapsing into one centered horizontal row while an item loads, (2) caret hugging the viewport bottom when typing at the end of a long markdoc document; verify how keystatic-theme.css reaches the admin.
- **Scope**: internal (src + node_modules dist inspection)
- **Date**: 2026-07-30

Package paths used below (pnpm hashed dirs, abbreviated):

- `CORE` = `node_modules/.pnpm/@keystatic+core@0.6.0_@keystar+ui@0.8.0_react-aria@3.50.0_react-dom@19.2.8_react@19.2.8_43de9047f12157ae902a8bf4bbea0d6e/node_modules/@keystatic/core`
- `KUI` = `node_modules/.pnpm/@keystar+ui@0.8.0_react-aria@3.50.0_react-dom@19.2.8_react@19.2.8__react@19.2.8__react-_3150f0e85b8cfe3b5f195ca7773e3e39/node_modules/@keystar/ui`
- `PMV` = `node_modules/.pnpm/prosemirror-view@1.42.1/node_modules/prosemirror-view`

---

## 1. How the theme CSS reaches the admin page

The custom shell `src/pages/keystatic/[...params].astro` does **not** link the theme sheet — it only contains the `#priority-ks-boot` overlay (inline `<style>`, lines 21–97) and mounts `<Keystatic client:only="react" />` (line 117).

The real chain:

| Step | File / line | Mechanism |
|---|---|---|
| 1 | `keystatic.config.ts:4` | `import './src/keystatic/ensure-theme'` — side-effect import; the config is bundled into the client Admin bundle, so this runs in the browser |
| 2 | `src/keystatic/ensure-theme.ts:11` | `import themeCss from '../styles/keystatic-theme.css?inline'` — Vite inlines the whole sheet as a string |
| 3 | `src/keystatic/ensure-theme.ts:136-153` | `ensureStyleTag()` injects `<style id="priority-keystatic-theme">` into `<head>` and re-appends it whenever it stops being the **last** head element (wins the cascade against emotion) |
| 4 | `src/keystatic/ensure-theme.ts:162-183` | Critical `--kui-*` custom properties are additionally written **inline** on the live `.kui-scheme--*` node |
| 5 | `src/keystatic/ensure-theme.ts:12-13` | Also side-effect imports `./draft-workflow` (the 保存草稿/发布 toolbar injector) |

**Conclusion**: editing `src/styles/keystatic-theme.css` is the right place for CSS fixes; it reliably reaches `/keystatic` (injected last, plus a MutationObserver keeps it last). No `.astro` change needed.

---

## 2. Bug 1 — spinner + 保存草稿/发布 in one centered horizontal row while an item loads

### 2.1 Keystatic's loading-state markup (evidence)

`ItemPageOuterWrapper` Suspense fallback — `CORE/dist/keystatic-core-ui.js:4386-4399`:

```js
fallback: jsx(ItemPageShell, { ...props,
  children: jsx(Flex, {
    alignItems: "center",
    justifyContent: "center",   // default direction = ROW
    minHeight: "scale.3000",    // 240px (KUI/src/core/cssCustomProperties.ts:513)
    children: jsx(ProgressCircle, {
      "aria-label": "Loading Item", isIndeterminate: true, size: "large" })
  })
})
```

`ItemPageShell` — `CORE/dist/keystatic-core-ui.js:4455-4521`: renders `PageRoot > [PageHeader, children]`. During loading `props.headerActions` is **undefined** (fallback spreads only route props), so the header contains just the sidebar toggle + breadcrumbs.

Page primitives — `CORE/dist/index-dd34a11c.js`:

- `PageRoot` (3530-3577): `Flex elementType="main" id={MAIN_PANEL_ID} direction="column"`; `MAIN_PANEL_ID = 'keystatic-main-panel'` (line 1135). → `<main id="keystatic-main-panel">`.
- `PageHeader` (3578-3688): `Box elementType="header"` → a **`<header>` element, not a `<div>`**.

So the loading DOM is:

```
main#keystatic-main-panel        (flex column)
├─ header                        (breadcrumbs already rendered — matches screenshot)
└─ div (emotion Flex: row, align center, justify center, min-height 240px)
   └─ div[role=progressbar][aria-label="Loading Item"][data-indeterminate][data-size=large]
```

(`ProgressCircle` DOM: `KUI/src/progress/ProgressCircle.tsx:47-60` — a `div` with react-aria `useProgressBar` props → `role="progressbar"` + the aria-label.)

### 2.2 Root cause: our own draft-workflow toolbar lands inside the centered Flex

The 保存草稿/发布 buttons are **not Keystatic's** — they are `#priority-draft-toolbar`, injected by `src/keystatic/draft-workflow.ts`:

- `ensureToolbar()` runs on every route tick and on an **800 ms poll** (`draft-workflow.ts:538-541`), including while the item is still loading (route is already `/branch/keystatic%2Fdrafts/collection/…/item/…`, so `isDraftEditing()` is true).
- `findHeaderActionsHost()` (`draft-workflow.ts:260-271`) resolves the injection host in this order:
  1. Parent of the native Save button (`button[type=submit][form="item-edit-form"|"item-create-form"]`) → **absent during loading** (that button is part of `HeaderActions`, only rendered by the loaded `ItemPageInner`, `keystatic-core-ui.js:3106-3117`).
  2. `document.getElementById('page-title')` → **absent on item pages entirely**; `HeaderBreadcrumbs` (`keystatic-core-ui.js:1548-1582`) renders plain breadcrumbs with no id. (`#page-title` exists only on collection list / dashboard / singleton pages: `keystatic-core-ui.js:735, 6109, 6668, 7286`.)
  3. Fallback: `main.querySelector(':scope > div')` — **the header is a `<header>`, not a `<div>`**, so the *first div child of `<main>`* is exactly the centered Suspense-fallback Flex.

Result: the toolbar (`display: inline-flex`, `draft-workflow.ts:160-166`) is appended into a `justify-content: center; align-items: center` **row** Flex next to the spinner → one horizontal centered row, exactly as in the screenshot. Once loading finishes, the poll re-runs, finds the native Save button, and re-parents the toolbar into the real header (`draft-workflow.ts:319-323`) — which is why the loaded page looks right.

**keystatic-theme.css is NOT the cause**: its only header rule, `main[id] > div:first-child` (line 454-467, sticky header), never matches on item pages (first child is `<header>`), and no theme rule centers anything here.

Note: the same fallback markup also exists in the **create** flow (`keystatic-core-ui.js:4767-4784`, duplicate-from-template / draft loading), so the same misplacement can occur on `/create` routes.

### 2.3 Stable selectors for this loading state

All verified present in the 0.6.0 dist; consistent with conventions the sheet already uses (`.kui-scheme--*`, `[data-keystatic-editor]`, `:has()` at lines 281-298 and 487-498):

| Thing | Selector | Evidence |
|---|---|---|
| Admin main panel | `#keystatic-main-panel` (or `main[id]`) | `index-dd34a11c.js:1135, 3552` |
| Item loading spinner | `[role='progressbar'][aria-label='Loading Item']` | `keystatic-core-ui.js:4394, 4775`; `ProgressCircle.tsx` |
| The centering Flex (no class/attr of its own) | `#keystatic-main-panel > div:has(> [role='progressbar'][aria-label='Loading Item'])` | structure above |
| Injected toolbar | `#priority-draft-toolbar` | `draft-workflow.ts:17` |

### 2.4 Candidate fixes (both CSS-only options land in keystatic-theme.css)

Option A — stack vertically (spinner above buttons), per task request:

```css
/* Item loading state: stack spinner above the injected draft toolbar */
#keystatic-main-panel > div:has(> [role='progressbar'][aria-label='Loading Item']) {
  flex-direction: column;
  gap: 1.25rem;
}
```

Option B — hide the toolbar while loading (arguably better UX: clicking 保存草稿 during loading only produces the「未找到保存按钮」error toast, since `findNativeSaveButton()` returns null — `draft-workflow.ts:337-340`):

```css
#keystatic-main-panel
  > div:has(> [role='progressbar'][aria-label='Loading Item'])
  #priority-draft-toolbar {
  display: none;
}
```

Root-cause (JS) alternative, if the implementer prefers fixing the injector instead: in `findHeaderActionsHost()` (`draft-workflow.ts:267-270`) use `main?.querySelector(':scope > header')` (the `PageHeader` element) instead of `':scope > div'`, and/or bail out of `ensureToolbar()` while `[aria-label="Loading Item"]` exists. This prevents the toolbar from ever entering the fallback Flex, on both item and create routes.

---

## 3. Bug 2 — caret glued to the bottom of the editor scroll area

### 3.1 Scroll-container anatomy (entryLayout: 'content')

Both collections use `entryLayout: 'content'` + `fields.markdoc` (`keystatic.config.ts:54, 87, 117-118, 155`). Above-mobile, `FormForEntry` (`CORE/dist/index-dd34a11c.js:10900-11025`) renders:

```
main#keystatic-main-panel
└─ form#item-edit-form (height 100%)              keystatic-core-ui.js:3188-3196
   └─ SplitView (autoSaveId "keystatic-content-split-view")   index-dd34a11c.js:10995
      ├─ SplitPaneSecondary  → context "main"                 index-dd34a11c.js:10952-10962
      │  └─ div[data-scrollable]   ← ★ THE SCROLL CONTAINER (overflow-y: auto)
      │     └─ … field wrappers …
      │        └─ div#keystatic-editor-root-…[data-keystatic-editor='root'][data-layout='main']
      │           ├─ [data-keystatic-editor='toolbar']         index-dd34a11c.js:25099-25102
      │           └─ div
      │              └─ div#keystatic-editor-content-…[data-keystatic-editor='content']
      │                 .ProseMirror  ← ★ the EditorView mount (view.dom)
      └─ SplitPanePrimary → context "side" → its own ScrollView (metadata fields)
```

- `ScrollView` = `View` + `data-scrollable` + `overflowY: auto` (`index-dd34a11c.js:1154-1197`).
- The content div **is** `view.dom`: `new EditorView({ mount: mountRef.current }, …)` (`index-dd34a11c.js:21424-21426`), mounted on `ProseMirrorEditable`'s div (`21460-21468`) which carries `data-keystatic-editor="content"` (`25117-25126`). ProseMirror adds the `.ProseMirror` class to it.
- Content padding today (`contentStyles`, `index-dd34a11c.js:24957-24983`): under `[data-layout="main"] > div > &` → `height: 100%`, `maxWidth: 800`, `margin-inline: auto`, padding `12px` mobile / `24px` >mobile / `32px` >tablet (`--kui-size-space-xxlarge` = `scale-400` = 32px, `KUI/src/core/cssCustomProperties.ts:496, 529`). So there is only **32px** of content below the last line at desktop — content end == scroll end, hence the glued caret.
- keystatic-theme.css currently touches the editor only at lines 718-722 (`[data-keystatic-editor]` → `border-radius`), nothing that affects scrolling or padding.

### 3.2 ProseMirror scroll mechanics (why CSS scroll-padding alone is not enough)

`PMV/dist/index.js:209-255` (`scrollRectIntoView`):

```js
let scrollThreshold = view.someProp("scrollThreshold") || 0,
    scrollMargin   = view.someProp("scrollMargin")   || 5;
…
else if (rect.bottom > bounding.bottom - getSide(scrollThreshold, "bottom"))
  moveY = rect.bottom - bounding.bottom + getSide(scrollMargin, "bottom");
…
elt.scrollTop += moveY;   // manual scrollTop math — ignores CSS scroll-padding
```

Keystatic's `useEditorView` (`index-dd34a11c.js:21415-21447`) passes **no** `scrollThreshold`/`scrollMargin` props, so PM-driven scrolls (Enter, paste, keymap commands — anything dispatched with `scrollIntoView()`) land the caret exactly **5px** above the scroll-container bottom. These are EditorView props — not reachable from CSS.

However, plain character typing goes through native contenteditable input; the **browser** does the caret-reveal scroll there, and Chromium/Safari honor `scroll-padding-bottom` for that; after PM reconciles the DOM change, `scrollRectIntoView` sees the caret already inside bounds and does not scroll back. So the reliable CSS-only strategy is **both** levers:

1. `padding-bottom` on the content element — grows scrollHeight past the last line so space below the caret can exist at all (today max-scroll coincides with the last line; no amount of manual scrolling can create breathing room).
2. `scroll-padding-bottom` on the `[data-scrollable]` container — keeps offset for browser-native caret scrolls while typing.

### 3.3 Proposed CSS (element that must receive the padding)

The padding must go on **`[data-keystatic-editor='content']`** (the `.ProseMirror` mount). It sits inside `[data-keystatic-editor='root']` which has `backgroundColor: canvas` (`index-dd34a11c.js:25137-25145`), so the padding area keeps a continuous background. Scope to `[data-layout='main']` so the small **bordered inline editors** (non-main layout gets `border` + `borderRadius`, `index-dd34a11c.js:25080-25083`) are not inflated:

```css
/* Breathing room below the caret at the end of the document */
[data-keystatic-editor='root'][data-layout='main']
  > div
  > [data-keystatic-editor='content'] {
  padding-bottom: 33vh !important; /* or a fixed 240-320px */
}

/* Keep browser-native caret scrolling away from the bottom edge */
[data-scrollable]:has([data-keystatic-editor='root'][data-layout='main']) {
  scroll-padding-bottom: 25vh;
}
```

Notes:

- Specificity `(0,3,0)` on the padding rule already beats emotion's `[data-layout="main"] > div > .css-…` `(0,2,0)`, and the theme sheet is injected last; `!important` is belt-and-braces consistent with the rest of the file. Override **only** `padding-bottom` (emotion sets the `padding` shorthand; overriding the shorthand would break top/side padding).
- Does not touch the loading state (editor not mounted then), the collection list, dashboard, or the side metadata pane (its ScrollView contains no `[data-keystatic-editor='root'][data-layout='main']`).
- Residual, unavoidable-via-CSS behavior: pressing Enter at the very end still momentarily places the caret ~5px above the container bottom (PM's `scrollMargin` default); the padding then lets the user (and subsequent typing) sit comfortably above the edge. A full "always N px below caret" guarantee would require the `scrollThreshold`/`scrollMargin` EditorView props (JS-level, inside the dist bundle — not patchable from this repo without forking).
- Recommend verifying the `scroll-padding-bottom` typing behavior once in the running admin (Chromium and Safari both honor it for caret reveal, but this is the one claim not verifiable from static code).

---

## 4. Risks / caveats

| Risk | Detail |
|---|---|
| `aria-label="Loading Item"` string | Hard-coded English literal in the dist (`keystatic-core-ui.js:4394, 4775`) — stable for 0.6.0, but could be renamed/localized in future Keystatic versions. It is the only hook distinguishing the item spinner from `"Loading Entries"` (collection list, line 977). |
| `data-*` attributes | `data-keystatic-editor` (root/toolbar/content) and `data-layout` are Keystatic's own semantic attrs; `data-scrollable` and `data-split-view-*` are keystar-ui internals (`KUI/src/split-view/SplitView.tsx:350-440`) — slightly more fragile across upgrades but far safer than hashed `.css-*` classes. |
| `#keystatic-main-panel` | Constant `MAIN_PANEL_ID` (`index-dd34a11c.js:1135`); the sheet's existing `main[id]` rules already depend on it. |
| `:has()` support | Already relied on by the sheet (lines 281-298, 487-498) — no new baseline requirement. |
| Bug 1 CSS-only fix vs JS fix | The CSS options style/hide a toolbar that is *misplaced by our own injector*. If `findHeaderActionsHost()` is later fixed (`:scope > header` instead of `:scope > div`), the CSS becomes dead but harmless. CSS Option A leaves clickable buttons that error-toast during loading; Option B (hide) avoids that. The create-route variant of the fallback (`keystatic-core-ui.js:4767-4784`) is only covered by the same selector because it uses the identical `aria-label`. |
| Editor padding scope | Scoping via `[data-layout='main']` excludes nested/inline markdoc editors and modals; the metadata side pane keeps its `RESPONSIVE_PADDING` Box (`index-dd34a11c.js:10870, 10975-10976`) untouched. |
| Toolbar hide rule for native Save | `draft-workflow.ts:205-216` visually-hides the native Save via `body.pd-has-toolbar` — unaffected by the proposed CSS. |

## Related specs

- None found — `.trellis/spec/` contains only empty `frontend/` and `guides/` scaffolding relevant to this topic.
