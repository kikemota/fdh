import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// Contraseñas: scrypt con sal por usuario. Sesiones: token firmado "datos.firma"
// (HMAC-SHA256 con SESSION_SECRET), válido 30 días.

const SESSION_DAYS = 30

export interface PasswordHash {
  salt: string
  hash: string
}

export function hashPassword(password: string): PasswordHash {
  const salt = randomBytes(16).toString('base64url')
  const hash = scryptSync(password, salt, 64).toString('base64url')
  return { salt, hash }
}

export function checkPassword(password: string, stored: PasswordHash): boolean {
  const candidate = scryptSync(password, stored.salt, 64)
  const expected = Buffer.from(stored.hash, 'base64url')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

export function passwordProblem(password: string): string | null {
  if (password.length < 10) return 'La contraseña debe tener al menos 10 caracteres.'
  if (password.length > 200) return 'La contraseña es demasiado larga.'
  return null
}

interface TokenPayload {
  sub: string
  exp: number
  /** Cambiar la versión de sesión cierra la sesión del usuario en todos sus dispositivos. */
  v: number
}

const sign = (data: string, secret: string) => createHmac('sha256', secret).update(data).digest('base64url')

export function issueToken(userId: string, sessionVersion: number, secret: string, now = Date.now()): string {
  const payload: TokenPayload = { sub: userId, exp: now + SESSION_DAYS * 86_400_000, v: sessionVersion }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data, secret)}`
}

export function readToken(token: string, secret: string, now = Date.now()): TokenPayload | null {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = sign(data, secret)
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as TokenPayload
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || payload.exp < now) return null
    return payload
  } catch {
    return null
  }
}

export const randomId = (bytes = 12) => randomBytes(bytes).toString('base64url')

export function bearer(req: Request): string | null {
  const h = req.headers.get('authorization') ?? ''
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null
}
