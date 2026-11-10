import { useEffect, useState } from 'react'

/** Enrutador mínimo por hash: "#/admin/personas" -> ["admin", "personas"]. */
export function parseHash(hash: string): string[] {
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}

export function useRoute(): string[] {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const href = (...parts: string[]) => '#/' + parts.join('/')
export const go = (...parts: string[]) => {
  window.location.hash = href(...parts)
}
