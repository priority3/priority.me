#!/usr/bin/env node
/**
 * Push comments env vars from .env.comments.local to Netlify via env:import
 * (handles multiline PEM safely).
 *
 * Prerequisites:
 *   pnpm exec netlify login
 *   pnpm exec netlify link
 *
 * Usage:
 *   node scripts/push-comments-env-to-netlify.mjs
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const file = join(root, '.env.comments.local')
if (!existsSync(file)) {
  console.error('Missing .env.comments.local — run: pnpm setup:comments')
  process.exit(1)
}

const env = Object.fromEntries(
  readFileSync(file, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=')
      let v = l.slice(i + 1)
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      return [l.slice(0, i), v]
    }),
)

const keys = [
  'COMMENTS_GITHUB_APP_ID',
  'COMMENTS_GITHUB_CLIENT_ID',
  'COMMENTS_GITHUB_CLIENT_SECRET',
  'COMMENTS_GITHUB_PRIVATE_KEY',
  'COMMENTS_SESSION_SECRET',
]

for (const k of keys) {
  if (!env[k]) {
    console.error('Missing', k, 'in .env.comments.local')
    process.exit(1)
  }
}

const tmp = join(root, '.env.comments.netlify-import')
let body = ''
for (const k of keys) {
  // Keep literal \n as-is: `netlify env:import` turns it into a real newline.
  // Doubling backslashes here (\n → \\n) made the parser emit "\" + newline,
  // leaving a stray "\" on every PEM line and breaking JWT signing in prod.
  const v = env[k].replace(/"/g, '\\"')
  body += `${k}="${v}"\n`
}
writeFileSync(tmp, body)

try {
  console.log('Importing comments env vars into Netlify…')
  execSync(`npx netlify env:import "${tmp}"`, {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
  })
  console.log('\nDone. Trigger a new deploy on Netlify.')
} finally {
  try {
    unlinkSync(tmp)
  } catch {
    /* ignore */
  }
}
