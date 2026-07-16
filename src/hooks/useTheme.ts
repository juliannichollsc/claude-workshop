import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

function read(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

// `data-theme` en <html> es la única fuente de verdad: el hook y el fondo 3D leen de ahí,
// así que un cambio hecho por cualquiera (incluido el flash de arranque) los sincroniza a ambos.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  document.documentElement.dataset.theme = stored ?? 'dark'
}

export function setTheme(next: Theme) {
  const apply = () => {
    document.documentElement.dataset.theme = next
    localStorage.setItem(STORAGE_KEY, next)
  }
  if (!document.startViewTransition) {
    apply()
    return
  }
  document.startViewTransition(apply)
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => 'dark' as const)
}
