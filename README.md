## [Priority.me](https://razet.me/)

> recording ...

Personal site of **raze** — notes, projects, and leetcode.

### Stack

- [Astro](https://astro.build) (static pages + Netlify Functions for admin)
- Hand-copied [Yohaku](https://github.com/Innei/Yohaku)-inspired design tokens
- Markdown Content Collections
- [Keystatic](https://keystatic.com) (CMS — local + online via GitHub)
- [Umami](https://umami.is) (optional analytics)

### Scripts

```bash
pnpm install
pnpm dev      # local site + Keystatic at /keystatic
pnpm build    # Netlify-ready build
pnpm preview  # preview production build
```

### Content

- `src/content/blogs/` — posts
- `src/content/leetcode/` — leetcode & typehero notes

#### Write locally

```bash
pnpm dev
# open http://localhost:4321/keystatic
```

Saves Markdown under `src/content/*`. Commit + push → Netlify rebuilds.

#### Write online (production)

Admin URL (after deploy + GitHub App setup):

```
https://razet.me/keystatic
```

**Who can write?** Only GitHub users who can push to `priority3/priority.me` and complete GitHub App OAuth — not anonymous visitors.

**One-time setup (GitHub App + Netlify env):**

1. Create a GitHub App: https://github.com/settings/apps/new  
   - **GitHub App name**: e.g. `priority-me-keystatic`  
   - **Homepage URL**: `https://razet.me`  
   - **Callback URL**: `https://razet.me/api/keystatic/github/oauth/callback`  
   - **Setup URL** (optional): same as homepage  
   - **Webhook**: uncheck Active (not required for Keystatic)  
   - **Repository permissions**:  
     - Contents: Read & write  
     - Metadata: Read-only  
     - Pull requests: Read & write (if you use PR workflow)  
   - **Where can this App be installed?**: Only on this account  
2. After create → **Generate a new client secret**, note **Client ID**, **slug** (`github.com/apps/<slug>`).  
3. Install the App on **`priority3/priority.me`** only.  
4. Netlify → Site settings → Environment variables:

| Variable | Value |
|----------|--------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App Client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Client secret |
| `KEYSTATIC_SECRET` | random, e.g. `openssl rand -hex 32` |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | App slug (e.g. `priority-me-keystatic`) |

5. Redeploy. Open `/keystatic` → **Log in with GitHub** → edit → commit. Netlify rebuilds from the new commit.

Also add local callback if you test GitHub mode on dev:

```
http://127.0.0.1:4321/api/keystatic/github/oauth/callback
```

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

### Presence (ProcessReporter)

Optional live activity chip next to the **PR.** mark in the header. No Slack / Discord / S3 required.

1. Set a shared secret (local `.env` + Netlify env):

```bash
PRESENCE_TOKEN=$(openssl rand -hex 24)
```

2. In [ProcessReporter](https://github.com/Innei/ProcessReporter), enable only the **MixSpace** destination:

| Field | Value |
|-------|--------|
| Endpoint | `https://razet.me/api/presence` |
| API token | same as `PRESENCE_TOKEN` |
| Method | `POST` |
| Slack / Discord / S3 | off |

3. Local debug (`pnpm dev`): endpoint `http://127.0.0.1:4321/api/presence` (in-memory store). Production uses Netlify Blobs.

Public read: `GET /api/presence` (no token). Window titles are stripped server-side; hide sensitive apps in ProcessReporter privacy rules.

<samp>code is licensed under <a href='./LICENSE'>MIT</a>,<br> words and images are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/'>CC BY-NC-SA 4.0</a></samp>.
