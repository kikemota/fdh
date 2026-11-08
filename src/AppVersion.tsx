import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const CHECK_EVERY_MS = 30 * 60 * 1000

const builtAt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(__APP_BUILT_AT__))

/** Busca versiones nuevas (al abrir, al volver a la app y cada 30 minutos) y avisa con un botón "Actualizar". */
export function useActualizacion() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      setRegistration(reg)
    },
  })

  useEffect(() => {
    if (!registration) return
    const check = () => {
      if (navigator.onLine) registration.update().catch(() => {})
    }
    const onVisible = () => document.visibilityState === 'visible' && check()
    const timer = window.setInterval(check, CHECK_EVERY_MS)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [registration])

  return { needRefresh, updateServiceWorker }
}

/** Aviso flotante cuando hay una versión nueva descargada. */
export function AvisoActualizacion() {
  const { needRefresh, updateServiceWorker } = useActualizacion()
  const [updating, setUpdating] = useState(false)
  if (!needRefresh) return null
  return (
    <div className="update-bar" role="status">
      <span>Hay una versión nueva de Fdh App.</span>
      <button
        className="btn btn-sm"
        type="button"
        disabled={updating}
        onClick={() => {
          setUpdating(true)
          void updateServiceWorker(true)
          // La página se recarga cuando manda la versión nueva. Si se abrió antes de instalar ninguna, recargamos igualmente.
          window.setTimeout(() => window.location.reload(), 2500)
        }}
      >
        {updating ? 'Actualizando…' : 'Actualizar'}
      </button>
    </div>
  )
}

/** Versión instalada y fecha de compilación. */
export function VersionApp() {
  return (
    <p className="version" title={`Compilación ${__APP_BUILD__}`}>
      Fdh App v{__APP_VERSION__} · {builtAt}
    </p>
  )
}
