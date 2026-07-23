# Design · Keystatic + Umami

## Decisions

| Topic | Choice | Why |
|-------|--------|-----|
| CMS | Keystatic local | Git-native MD, Astro-friendly, no DB |
| Admin availability | `astro dev` only | Keystatic needs SSR routes; production stays pure static |
| Analytics | Umami via env | Optional; no vendor lock in HTML when unset |
| React | Dev-only integration | Avoid shipping React client to public site |

## Integration points

```
keystatic.config.ts     → schema for blogs / leetcode
astro.config.mjs        → enable react+keystatic when argv has "dev"
src/components/Umami.astro + BaseLayout → analytics script
.env.example            → PUBLIC_UMAMI_*
src/content.config.ts   → load .md and .mdoc; empty tag → undefined
```

## Out of scope

- Online `/keystatic` on Netlify (would need adapter + server output)
- Self-hosted Umami setup
- Custom dashboard UI aggregating Umami API
