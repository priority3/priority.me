# Implement notes

## Done (P0)

1. GitHub helpers + draft prepare/publish (`src/lib/github.ts`, `src/lib/drafts.ts`)
2. API `GET/POST /api/keystatic/drafts`
3. Admin client workflow (`src/keystatic/draft-workflow.ts`) wired via `ensure-theme.ts`
4. Netlify build ignore for `keystatic/drafts`
5. Docs in keystatic.config header + task design.md

## Manual verify on production

1. Open `/keystatic` → GitHub auth
2. Edit existing blog → should redirect to `branch/keystatic%2Fdrafts/...`
3. Change text → Save (drafts commit only)
4. Publish with 可见 checkbox → main updated, draft file gone
5. Confirm Netlify build runs from main only

## Follow-ups

- Stronger empty-body detection (ProseMirror JSON)
- Draft list badge on collection view
- Multi-file entry assets beyond markdown image refs
