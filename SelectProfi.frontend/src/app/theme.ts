export const themeStorageKey = 'selectprofi.ui.theme'

export type Theme = 'light' | 'dark'

function isTheme(value: string): value is Theme {
  return value === 'light' || value === 'dark'
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function readTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedValue = window.localStorage.getItem(themeStorageKey)
  if (!storedValue) {
    return getSystemTheme()
  }

  return isTheme(storedValue) ? storedValue : getSystemTheme()
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  window.localStorage.setItem(themeStorageKey, theme)
}

export function getNextTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}

