// Reason: Keystatic Admin is client:only. Importing this from keystatic.config
// runs as soon as the Admin bundle loads (including the GitHub login screen),
// not only after BrandMark mounts in the sidebar.
import themeCss from '../styles/keystatic-theme.css?inline'

const STYLE_ID = 'priority-keystatic-theme'
const FONT_ID = 'priority-keystatic-font'

export function ensureKeystaticTheme() {
  if (typeof document === 'undefined') return

  if (!document.getElementById(FONT_ID)) {
    const link = document.createElement('link')
    link.id = FONT_ID
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap'
    document.head.appendChild(link)
  }

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = themeCss
    document.head.appendChild(style)
  }
}

ensureKeystaticTheme()
