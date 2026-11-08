// Utilidades compartidas por la API (sin imports exclusivos de Node).

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const deny = (message = 'No tienes permiso para esto.') => new HttpError(403, message)
export const notFound = (message = 'No encontrado.') => new HttpError(404, message)
export const badRequest = (message: string) => new HttpError(400, message)

export const now = () => new Date().toISOString()

/** Texto recortado a `max` caracteres; '' si no es un texto. */
export const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Id aleatorio apto para URL (Web Crypto, disponible en navegador y Node 22). */
export function randomKey(bytes = 9): string {
  const b = new Uint8Array(bytes)
  globalThis.crypto.getRandomValues(b)
  let s = ''
  for (const x of b) s += String.fromCharCode(x)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

let lastTime = 0

/** Id que se ordena por fecha de creación (estrictamente creciente dentro de un proceso). */
export function timeKey(): string {
  lastTime = Math.max(Date.now(), lastTime + 1)
  return lastTime.toString(36).padStart(10, '0') + randomKey(4)
}
