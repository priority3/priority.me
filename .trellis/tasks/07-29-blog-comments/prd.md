# Blog comments via GitHub Issues

## Goal

Visitors sign in with GitHub and leave comments on blog posts. Comments are stored as GitHub Issue comments. An Issue is created **only when the first comment** on that post is submitted, labeled `blog-comment`.

## Acceptance

- [ ] Blog **and** Leetcode post pages show Comments
- [ ] Keys are namespaced (`blogs/<id>`, `leetcode/<id>`) so ids cannot clash
- [ ] Issue link points at the correct public URL (`/posts/...` or `/leetcode/...`)
- [ ] Unauthenticated: prompt to log in with GitHub (`read:user` only)
- [ ] Authenticated: can submit a comment
- [ ] First comment on a post creates an Issue with label `blog-comment` and slug marker
- [ ] Subsequent comments append to the same Issue (no new Issue)
- [ ] Posts with zero comments create no Issue
- [ ] UI shows author avatar/login from session attribution
- [ ] Link to the GitHub Issue when it exists
- [ ] Missing env → graceful “not configured” (no crash)

## Out of scope

- Leetcode pages
- Nested replies / reactions
- Comment edit/delete from the site UI
- Markdown rendering in comments (plain text)
