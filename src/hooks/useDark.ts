import { useEffect, useState } from 'react'
import { Theme } from '@/constants'

const StoryKey = 'darkModel'

function operateHtmlClassList(theme: Theme) {
  const el = document.querySelector('html')
  if (theme === Theme.light) {
    el?.classList.remove(Theme.dark)
    el?.classList.add(Theme.light)
  }
  else {
    el?.classList.remove(Theme.light)
    el?.classList.add(Theme.dark)
  }
}

export function useDark() {
  const [theme, setTheme] = useState<Theme>()
  const isDark = theme === Theme.dark

  useEffect(() => {
    const themeMedia = window.matchMedia('(prefers-color-scheme: light)')
    const defaultTheme
      = (localStorage.getItem(StoryKey) ?? (themeMedia.matches ? Theme.dark : Theme.light)) as Theme
    setTheme(defaultTheme)
    operateHtmlClassList(defaultTheme)
  }, [])

  const toggle = () => {
    const toggledTheme = theme === Theme.light ? Theme.dark : Theme.light
    operateHtmlClassList(toggledTheme)
    setTheme(toggledTheme)
    localStorage.setItem(StoryKey, toggledTheme)
  }

  return { isDark, toggle }
}

