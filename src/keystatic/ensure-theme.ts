// Reason: Keystatic Admin is client:only. Keystar sets scheme tokens with
// emotion injectGlobal. Stylesheet overrides can lose by load order. We:
// 1) inject a late <style> tag with full skin CSS
// 2) write critical CSS variables onto the live .kui-scheme--* node (inline
//    custom properties always beat stylesheets for that element + descendants)

import themeCss from '../styles/keystatic-theme.css?inline'

const STYLE_ID = 'priority-keystatic-theme'
const FONT_ID = 'priority-keystatic-font'
const APPLIED_ATTR = 'data-priority-skin'

const LIGHT = {
  // neutrals → parchment
  '--kui-color-scale-slate1': '#fefefb',
  '--kui-color-scale-slate2': '#f9f8f5',
  '--kui-color-scale-slate3': '#f0efeb',
  '--kui-color-scale-slate4': '#e3e1db',
  '--kui-color-scale-slate5': '#d0cec6',
  '--kui-color-scale-slate6': '#a8a69f',
  '--kui-color-scale-slate7': '#787670',
  '--kui-color-scale-slate8': '#5c5a55',
  '--kui-color-scale-slate9': '#403f3a',
  '--kui-color-scale-slate10': '#24231f',
  '--kui-color-scale-slate11': '#141312',
  // indigo → ume
  '--kui-color-scale-indigo1': '#fdf8f9',
  '--kui-color-scale-indigo2': '#faf0f2',
  '--kui-color-scale-indigo3': '#f5e0e4',
  '--kui-color-scale-indigo4': '#efcdd3',
  '--kui-color-scale-indigo5': '#e6b0ba',
  '--kui-color-scale-indigo6': '#d9929f',
  '--kui-color-scale-indigo7': '#cc7a89',
  '--kui-color-scale-indigo8': '#c56473',
  '--kui-color-scale-indigo9': '#c56473',
  '--kui-color-scale-indigo10': '#b05362',
  '--kui-color-scale-indigo11': '#8f3f4d',
  '--kui-color-background-canvas': '#fefefb',
  '--kui-color-background-surface': '#f9f8f5',
  '--kui-color-background-surface-secondary': '#f0efeb',
  '--kui-color-background-surface-tertiary': '#e3e1db',
  '--kui-color-background-accent': '#f5e0e4',
  '--kui-color-background-accent-emphasis': '#c56473',
  '--kui-color-foreground-accent': '#8f3f4d',
  '--kui-color-border-accent': '#d9929f',
  '--kui-color-foreground-neutral': '#24231f',
  '--kui-color-foreground-neutral-emphasis': '#141312',
  '--kui-color-foreground-neutral-secondary': '#5c5a55',
  '--kui-color-foreground-neutral-tertiary': '#787670',
  '--kui-color-border-neutral': '#d0cec6',
  '--kui-color-border-muted': '#e3e1db',
  '--kui-color-alias-focus-ring': '#c56473',
  '--kui-color-alias-border-focused': '#c56473',
  '--kui-color-alias-border-selected': '#c56473',
  '--kui-color-alias-foreground-selected': '#8f3f4d',
  '--kui-color-alias-foreground-focused': '#8f3f4d',
  '--kui-color-alias-background-selected':
    'color-mix(in srgb, transparent, #c56473 12%)',
  '--kui-color-alias-background-selected-hovered':
    'color-mix(in srgb, transparent, #c56473 18%)',
  '--kui-typography-font-family-base':
    "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans SC', sans-serif",
  '--kui-animation-easing-ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
  '--kui-animation-easing-ease-in-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const

const DARK = {
  '--kui-color-scale-slate1': '#1c1c1e',
  '--kui-color-scale-slate2': '#242426',
  '--kui-color-scale-slate3': '#2e2e30',
  '--kui-color-scale-slate4': '#3a3a3c',
  '--kui-color-scale-slate5': '#48484a',
  '--kui-color-scale-slate6': '#636366',
  '--kui-color-scale-slate7': '#8e8e93',
  '--kui-color-scale-slate8': '#aeaeb2',
  '--kui-color-scale-slate9': '#c7c7cc',
  '--kui-color-scale-slate10': '#e5e5ea',
  '--kui-color-scale-slate11': '#f5f5f7',
  '--kui-color-scale-indigo1': '#24181a',
  '--kui-color-scale-indigo2': '#2c1c20',
  '--kui-color-scale-indigo3': '#3a2429',
  '--kui-color-scale-indigo4': '#4a2d34',
  '--kui-color-scale-indigo5': '#5c3840',
  '--kui-color-scale-indigo6': '#7a4a55',
  '--kui-color-scale-indigo7': '#9a5d6a',
  '--kui-color-scale-indigo8': '#b86c7a',
  '--kui-color-scale-indigo9': '#d67a88',
  '--kui-color-scale-indigo10': '#e08f9b',
  '--kui-color-scale-indigo11': '#efb0ba',
  '--kui-color-background-canvas': '#1c1c1e',
  '--kui-color-background-surface': '#242426',
  '--kui-color-background-surface-secondary': '#2e2e30',
  '--kui-color-background-surface-tertiary': '#3a3a3c',
  '--kui-color-background-accent': '#3a2429',
  '--kui-color-background-accent-emphasis': '#d67a88',
  '--kui-color-foreground-accent': '#efb0ba',
  '--kui-color-border-accent': '#7a4a55',
  '--kui-color-foreground-neutral': '#e5e5ea',
  '--kui-color-foreground-neutral-emphasis': '#f5f5f7',
  '--kui-color-foreground-neutral-secondary': '#aeaeb2',
  '--kui-color-foreground-neutral-tertiary': '#8e8e93',
  '--kui-color-border-neutral': '#3a3a3c',
  '--kui-color-border-muted': '#2e2e30',
  '--kui-color-alias-focus-ring': '#d67a88',
  '--kui-color-alias-border-focused': '#d67a88',
  '--kui-color-alias-border-selected': '#d67a88',
  '--kui-color-alias-foreground-selected': '#efb0ba',
  '--kui-color-alias-foreground-focused': '#efb0ba',
  '--kui-color-alias-background-selected':
    'color-mix(in srgb, transparent, #d67a88 14%)',
  '--kui-color-alias-background-selected-hovered':
    'color-mix(in srgb, transparent, #d67a88 22%)',
  '--kui-typography-font-family-base':
    "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans SC', sans-serif",
  '--kui-animation-easing-ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
  '--kui-animation-easing-ease-in-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const

function ensureFont() {
  if (document.getElementById(FONT_ID)) return
  const link = document.createElement('link')
  link.id = FONT_ID
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap'
  document.head.appendChild(link)
}

function ensureStyleTag() {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = themeCss
  }
  // last in <head> → wins stylesheet source-order fights
  document.head.appendChild(style)
}

function isDarkScheme(el: Element): boolean {
  if (el.classList.contains('kui-scheme--dark')) return true
  if (el.classList.contains('kui-scheme--light')) return false
  // auto
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function paintSchemeRoot(el: HTMLElement) {
  const tokens = isDarkScheme(el) ? DARK : LIGHT
  for (const [key, value] of Object.entries(tokens)) {
    el.style.setProperty(key, value)
  }
  el.setAttribute(APPLIED_ATTR, isDarkScheme(el) ? 'dark' : 'light')

  const bg = tokens['--kui-color-background-canvas']
  document.documentElement.style.background = bg
  document.body.style.background = bg
}

function skinAllSchemeRoots() {
  const nodes = document.querySelectorAll<HTMLElement>(
    '.kui-scheme--light, .kui-scheme--dark, .kui-scheme--auto',
  )
  nodes.forEach(paintSchemeRoot)
}

let watching = false

function watch() {
  if (watching) return
  watching = true

  const run = () => {
    ensureStyleTag()
    skinAllSchemeRoots()
  }

  const obs = new MutationObserver(run)
  obs.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  })

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', run)

  ;[0, 30, 100, 300, 800, 2000].forEach((ms) => window.setTimeout(run, ms))
}

export function ensureKeystaticTheme() {
  if (typeof document === 'undefined') return
  ensureFont()
  ensureStyleTag()
  skinAllSchemeRoots()
  watch()
}

ensureKeystaticTheme()
