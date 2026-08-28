# WebMCP Agent Tools

> How this site exposes capabilities to browser-integrated AI agents, and the rules
> that keep it from breaking the site or leaking server code into the browser.

Code lives in `src/lib/webmcp/`, mounted by `src/components/WebMcp.astro` from `BaseLayout.astro`.

Spec: <https://github.com/webmachinelearning/webmcp> — API is
`document.modelContext.registerTool(tool, { signal })`.

---

## Non-negotiables

### 1. Never import `@/lib/comments` (or `@/lib/github`, `@/lib/comments-token`) from client code

`src/lib/comments.ts` looks like a bag of pure helpers, but it transitively imports
`@/lib/github` and `@/lib/comments-token`, both of which read server-side env. Importing it
from a browser module drags secrets-adjacent code into the client bundle.

This is why `src/lib/webmcp/page-context.ts` re-implements `commentKey()` as a one-liner
instead of importing it. **If you change `commentKey()` in `src/lib/comments.ts`, update
`toCommentKey()` in `page-context.ts` to match** — the duplication is deliberate, not an oversight.

The same rule is why `Comments.astro` computes the key in its frontmatter and passes it down
through `data-slug` rather than computing it in the client script.

### 2. Feature-detect, then dynamic-import

`WebMcp.astro` ships **only** a feature check to every visitor (~230 bytes). The ~12KB of tool
code loads via `import()` and only when `document.modelContext?.registerTool` exists.

Reason: WebMCP is an origin trial (Chrome 149 / Edge 150). Almost no visitor has a host for it,
so eagerly bundling the tools would be pure waste. Keep this shape when adding tools.

### 3. Navigation is an allowlist, and it must track the routes

`resolveInternalPath()` in `tools/navigation.ts` permits only `/`, `/posts`, `/posts/<slug>`,
`/leetcode`, `/leetcode/<slug>`. `/keystatic` and `/api/*` are excluded *by construction*,
not by an explicit ban.

**Adding a public route means adding it to `ALLOWED_PREFIXES`.** Adding a private one means
doing nothing. Prefix comparison is `=== prefix || startsWith(prefix + '/')` — never a bare
`startsWith(prefix)`, which would let `/postsevil` through.

### 4. Side-effecting tools stop at the confirmation boundary

`draft-comment` fills the existing textarea and scrolls to it. It **never** calls `submit()`,
`requestSubmit()`, or clicks the submit button. Publishing a comment writes to a GitHub Issue
under the visitor's own identity and cannot be undone.

Any future tool that writes, deletes, or spends follows the same shape: prepare the action in
the existing UI, then return text telling the agent to hand control back to the user.

Guard when reviewing: `grep -rnE 'requestSubmit|\.submit\(' src/lib/webmcp/` must stay empty.

### 5. Tools return error *results*, never throw

Every `execute` returns `err('…')` on failure. A thrown exception reaches the agent as an opaque
`DOMException`; readable text lets the model fix its arguments and retry. Arguments come from an
LLM and are untrusted — read them through `src/lib/webmcp/args.ts`, never destructure directly.

---

## Search index

`src/pages/search-index.json.ts` emits `dist/search-index.json` at build time.

It **must** source posts through `getBlogPosts()` / `getLeetcodePosts()` and build paths through
`postHref()` (both in `src/lib/posts.ts`). That is what makes the index inherit `display: false`
filtering and stay in sync with real routes for free.

Note the asymmetry: `posts/[...slug].astro` uses an *unfiltered* `getCollection`, so a
`display: false` post still gets a page — it just never appears in lists or in the index.
Current counts: 15 indexed of 16 files (`toy-record.md` is hidden).

The index is fetched lazily on first content-tool use, cached in a module-level promise, and
cleared on failure so a later call can retry. Do not preload it.

Ranking is weighted substring counting (title 8, desc 4, tag 3, body 1 capped at 10 hits),
not semantic search. Chinese queries work because matching is substring-based, not tokenised.

---

## Adding a tool

1. Put it in the matching `src/lib/webmcp/tools/*.ts`; add a new file if it is a new domain.
2. Write `description` in **English** (the agent's model reads it); return user-facing text in
   **Chinese** (the site's language).
3. Validate every argument via `args.ts`. Return `err()` — never throw.
4. Export it through the domain array; `register.ts` picks it up automatically.
5. If it has side effects, apply rule 4 above.

---

## Origin trial

`BaseLayout.astro` emits `<meta http-equiv="origin-trial">` only when
`PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN` is set. Unset → no tag, tools stay dormant, site unaffected.
Tokens are per-origin and expire; re-register at <https://developer.chrome.com/origintrials>.

## Verifying without a WebMCP browser

Firefox and Safari have no implementation, so most checks are indirect:

- `pnpm build` → `dist/search-index.json` exists with the expected post count
- Bundle the pure logic with esbuild and exercise it under Node with a mocked `fetch`
  (`searchPosts`, `findPost`, `resolveInternalPath` are all environment-light by design —
  keep them that way so they stay testable)
- Confirm `dist/_astro/WebMcp.*.js` stays tiny and the tool chunk is separate
- Actual tool invocation needs Chrome 149+ with the trial token/flag, or ChatGPT Desktop
