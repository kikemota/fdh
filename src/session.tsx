import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError, getToken, setToken } from './api/http'
import type { LoginResponse, MeResponse } from './api/types'

// Quién gestiona el contenido: nadie (vecino sin sesión) o un editor/administrador con sesión iniciada.

type State = { kind: 'loading' } | { kind: 'signedOut'; message?: string } | { kind: 'signedIn'; me: MeResponse }

interface Session {
  state: State
  signedIn: (res: LoginResponse) => Promise<void>
  signOut: () => void
  refresh: () => Promise<void>
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => (getToken() ? { kind: 'loading' } : { kind: 'signedOut' }))

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setState({ kind: 'signedOut' })
      return
    }
    try {
      setState({ kind: 'signedIn', me: await api.me() })
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setToken(null)
        setState({ kind: 'signedOut', message: e.message })
      } else {
        setState({ kind: 'signedOut', message: e instanceof Error ? e.message : 'No se ha podido contactar con el servidor.' })
      }
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const session: Session = {
    state,
    refresh,
    async signedIn(res) {
      setToken(res.token)
      window.location.hash = '#/admin'
      await refresh()
    },
    signOut() {
      setToken(null)
      setState({ kind: 'signedOut' })
      window.location.hash = '#/'
    },
  }
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export function useSession(): Session {
  const s = useContext(SessionContext)
  if (!s) throw new Error('useSession fuera de SessionProvider')
  return s
}

/** La persona con sesión iniciada, o null. */
export function useEditor(): MeResponse | null {
  const { state } = useSession()
  return state.kind === 'signedIn' ? state.me : null
}
