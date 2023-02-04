import { useEffect, useState } from 'react'

export function useDark() {
  const themeMedia = window.matchMedia('(prefers-color-scheme: light)')

  const defaultTheme = localStorage.getItem('theme') ?? (themeMedia.matches ? 'light' : 'dark')

  // const defaultTheme = localStorage.getItem('theme') || 'light'

  const [theme, setTheme] = useState(
    defaultTheme,
  )
  const [isDark, setIsDark] = useState(false)
  const toggleTheme = () => {
    if (theme === 'light')
      setTheme('dark')

    else
      setTheme('light')
  }
  useEffect(() => {
    localStorage.setItem('theme', theme)
    const el = document.querySelector('html')
    if (theme === 'light') {
      el?.classList.remove('dark')
      el?.classList.add('light')
    }
    else {
      el?.classList.remove('light')
      el?.classList.add('dark')
    }
  }, [theme])

  useEffect(() => {
    setIsDark(theme === 'dark')
  }, [theme])

  return { isDark, toggleTheme }
}
