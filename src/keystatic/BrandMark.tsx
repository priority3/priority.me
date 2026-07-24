import { useEffect, type ReactElement } from 'react'
import { ensureKeystaticTheme } from './ensure-theme'

/**
 * Sidebar brand mark for Keystatic Admin.
 * Mirrors the public site BrandMark.astro (PR. + underline flourish).
 * Theme CSS is bootstrapped from keystatic.config via ensure-theme.
 */
export function BrandMark(props: {
  colorScheme: 'light' | 'dark'
}): ReactElement {
  void props.colorScheme

  useEffect(() => {
    ensureKeystaticTheme()
  }, [])

  return (
    <svg
      className="ks-brand-mark"
      width="56"
      height="28"
      viewBox="0 0 164 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        className="ks-brand-mark__flourish"
        d="M20 60 C52 72, 104 70, 146 54"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text className="ks-brand-mark__text" x="10" y="54" fill="currentColor">
        PR.
      </text>
    </svg>
  )
}
