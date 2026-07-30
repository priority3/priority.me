# Keystatic Draft Save / Publish Workflow

## Problem

Keystatic Admin loses in-progress writing when leaving the editor (no reliable cloud draft). Native Save commits straight to `main`, polluting history and publishing unfinished work.

## Goals

1. **Auto-save**: browser IndexedDB only (Keystatic built-in) — no GitHub commit
2. **Save** (manual): commit only to `keystatic/drafts` branch
3. **Publish** (manual): merge entry into `main`, then **delete** draft from `keystatic/drafts`
4. **Edit published posts**: same draft loop (prepare → edit on drafts → save → publish → delete)
5. **Non-empty Save/Publish**: title/slug + body required
6. **Visibility**: keep `display` checkbox (list visibility after publish)

## Acceptance criteria

- [ ] Editing in production never auto-commits to `main`
- [ ] Manual Save creates/updates commit on `keystatic/drafts` only
- [ ] Publish writes `src/content/{collection}/{slug}.md` to `main` and removes it from drafts
- [ ] Re-editing a published post copies main → drafts if no draft exists, then same flow
- [ ] Save/Publish rejected when title or content is empty
- [ ] `display: false` still hides from site lists after publish
- [ ] `keystatic/drafts` does not trigger production Netlify deploys
- [ ] Local `storage: local` dev mode keeps simple on-disk save (no forced draft branch)

## Out of scope (P0)

- Multi-author conflict UI
- Encrypted drafts / public-repo privacy hardening beyond private branch discipline
- Full image-asset graph sync beyond markdown-referenced `/images/...` paths
