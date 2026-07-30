# Design: Keystatic draft / publish

## Decisions

| Topic | Choice |
|---|---|
| Auto-save | Keystatic IndexedDB only (no commit) |
| Manual Save | Native Keystatic Save on branch `keystatic/drafts` |
| Publish | Custom Admin banner → `POST /api/keystatic/drafts` action `publish` |
| After publish | Delete entry file on drafts branch |
| Edit published | `prepare` copies main → drafts if no draft, then redirect to drafts branch |
| Empty guard | Client click-capture on Save/Create + server `validateEntryMarkdown` on publish |
| Visibility | Existing `display` field; publish banner checkbox rewrites frontmatter |
| Build | Netlify ignore when `BRANCH=keystatic/drafts` |

## Modules

- `src/lib/draft-constants.ts` — branch names (client-safe)
- `src/lib/github.ts` — Contents API + ensure branch
- `src/lib/drafts.ts` — prepare / publish / validate
- `src/pages/api/keystatic/drafts.ts` — authenticated API (GH cookie)
- `src/keystatic/draft-workflow.ts` — Admin SPA inject (imported from `ensure-theme.ts`)

## Auth

Reuses Keystatic cookie `keystatic-gh-access-token`. No new secrets.

## Local dev

`KEYSTATIC_STORAGE=local` (default in `pnpm dev`): workflow is a no-op; files write to disk as before.
