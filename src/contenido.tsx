import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from './api/http'
import type { Contenido } from './api/types'
import { AVISOS_INICIALES, EVENTOS_INICIALES } from './data'

// Avisos y eventos para todos: se piden al servidor al abrir la app, al volver a ella y cada 5 minutos.
// Sin servidor o sin conexión se muestra la última copia guardada en el móvil o, si no hay, el contenido inicial.

const CACHE_KEY = 'fdh:contenido'
const CADA_MS = 5 * 60 * 1000

type Origen = 'servidor' | 'copia' | 'inicial'

interface Estado extends Contenido {
  origen: Origen
  recargar: () => Promise<void>
}

const Ctx = createContext<Estado | null>(null)

function copiaGuardada(): Contenido | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Contenido) : null
  } catch {
    return null
  }
}

export function ContenidoProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<{ contenido: Contenido; origen: Origen }>(() => {
    const copia = copiaGuardada()
    return copia
      ? { contenido: copia, origen: 'copia' }
      : { contenido: { avisos: AVISOS_INICIALES, eventos: EVENTOS_INICIALES }, origen: 'inicial' }
  })

  const recargar = useCallback(async () => {
    try {
      const c = await api.contenido()
      setDatos({ contenido: c, origen: 'servidor' })
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(c))
      } catch {
        /* ignorar */
      }
    } catch {
      /* sin servidor: se queda lo que hay */
    }
  }, [])

  useEffect(() => {
    void recargar()
    const onVisible = () => document.visibilityState === 'visible' && void recargar()
    const timer = window.setInterval(() => void recargar(), CADA_MS)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [recargar])

  return <Ctx.Provider value={{ ...datos.contenido, origen: datos.origen, recargar }}>{children}</Ctx.Provider>
}

export function useContenido(): Estado {
  const c = useContext(Ctx)
  if (!c) throw new Error('useContenido fuera de ContenidoProvider')
  return c
}
