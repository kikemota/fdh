import type {
  Aviso,
  AvisoInput,
  Contenido,
  CreateInviteResponse,
  Evento,
  EventoInput,
  InviteInfo,
  LoginResponse,
  MeResponse,
  PublicUser,
  Role,
} from './types'

const TOKEN_KEY = 'fdh:token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignorar */
  }
}

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch('/api/v1/' + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Sin conexión. Comprueba internet y vuelve a intentarlo.')
  }
  const data = (await res.json().catch(() => null)) as { error?: string } | null
  if (!res.ok || data === null) {
    if (data === null) throw new ApiError(res.status || 404, 'El servidor de Fdh App no está disponible aquí.')
    throw new ApiError(res.status, data.error ?? 'Algo ha fallado. Vuelve a intentarlo.')
  }
  return data as T
}

export const api = {
  contenido: () => req<Contenido>('GET', 'contenido'),

  status: () => req<{ secretOk: boolean; setupDone: boolean; setupCodeSet: boolean }>('GET', 'status'),
  setup: (b: { code: string; email: string; name: string; password: string }) => req<LoginResponse>('POST', 'setup', b),
  login: (email: string, password: string) => req<LoginResponse>('POST', 'login', { email, password }),
  readInvite: (token: string) => req<InviteInfo>('GET', 'invites/' + token),
  acceptInvite: (token: string, name: string, password: string) => req<LoginResponse>('POST', `invites/${token}/accept`, { name, password }),

  me: () => req<MeResponse>('GET', 'me'),
  updateMe: (p: { name?: string; password?: string; currentPassword?: string }) => req<PublicUser>('PATCH', 'me', p),
  logoutEverywhere: () => req<{ ok: true }>('POST', 'logout-everywhere'),
  invite: (email: string, role: Role) => req<CreateInviteResponse>('POST', 'invites', { email, role }),
  setRole: (userId: string, role: Role) => req<PublicUser>('PATCH', 'people/' + userId, { role }),
  removePerson: (userId: string) => req<{ ok: true }>('DELETE', 'people/' + userId),

  crearAviso: (a: AvisoInput) => req<Aviso>('POST', 'avisos', a),
  editarAviso: (id: string, a: AvisoInput) => req<Aviso>('PUT', 'avisos/' + id, a),
  borrarAviso: (id: string) => req<{ ok: true }>('DELETE', 'avisos/' + id),
  crearEvento: (e: EventoInput) => req<Evento>('POST', 'eventos', e),
  editarEvento: (id: string, e: EventoInput) => req<Evento>('PUT', 'eventos/' + id, e),
  borrarEvento: (id: string) => req<{ ok: true }>('DELETE', 'eventos/' + id),
}
