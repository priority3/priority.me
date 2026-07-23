#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const file = join(root, '.env.keystatic.local')
if (!existsSync(file)) {
  console.error('Missing .env.keystatic.local — run pnpm setup:keystatic first')
  process.exit(1)
}

const env = Object.fromEntries(
  readFileSync(file, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const keys = [
  'KEYSTATIC_GITHUB_CLIENT_ID',
  'KEYSTATIC_GITHUB_CLIENT_SECRET',
  'KEYSTATIC_SECRET',
  'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG',
]

for (const k of keys) {
  if (!env[k]) {
    console.error('Missing', k)
    process.exit(1)
  }
}

console.log('Setting Netlify env vars (scopes: builds, functions, runtime, post-processing)...')
for (const k of keys) {
  // Use --force to overwrite
  execSync(
    `npx netlify env:set ${k} ${JSON.stringify(env[k])} --context production --context deploy-preview --context branch-deploy`,
    { cwd: root, stdio: 'inherit', shell: true },
  )
}
console.log('Done. Trigger a redeploy: npx netlify deploy --build  or push to main / "Clear cache and deploy site" in UI')
