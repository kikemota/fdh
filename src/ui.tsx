import { useState, type FormEvent } from 'react'

/** Envía un formulario y guarda el estado de "ocupado" y el error. */
export function useSubmit<T>(fn: () => Promise<T>) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = async (e?: FormEvent) => {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo ha fallado.')
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run, setError }
}

/** Botón de borrar con confirmación dentro de la propia página. */
export function BorrarConfirmando({ onConfirm, etiqueta = 'Borrar' }: { onConfirm: () => Promise<void>; etiqueta?: string }) {
  const [preguntando, setPreguntando] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!preguntando)
    return (
      <button type="button" className="link-sm link-peligro" onClick={() => setPreguntando(true)}>
        {etiqueta}
      </button>
    )
  return (
    <span className="confirmar">
      <span className="small">¿Seguro?</span>
      <button
        type="button"
        className="btn btn-sm btn-peligro"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          try {
            await onConfirm()
          } finally {
            setBusy(false)
            setPreguntando(false)
          }
        }}
      >
        Sí, {etiqueta.toLowerCase()}
      </button>
      <button type="button" className="link-sm" onClick={() => setPreguntando(false)}>
        No
      </button>
    </span>
  )
}
