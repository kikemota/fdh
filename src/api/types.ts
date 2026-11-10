// Formas compartidas por la app y la Netlify Function /api/v1.

export type Role = 'admin' | 'editor'

export interface PublicUser {
  id: string
  email: string
  name: string
  role: Role
}

export interface LoginResponse {
  token: string
  user: PublicUser
}

export interface MeResponse {
  user: PublicUser
  /** Solo administradores: todas las cuentas. */
  people?: PublicUser[]
}

export interface InviteInfo {
  email: string
  role: Role
  invitedBy: string
}

export interface CreateInviteResponse {
  token: string
  email: string
  role: Role
}

export type AvisoTipo = 'aviso' | 'bando' | 'urgente'

export interface Aviso {
  id: string
  titulo: string
  texto: string
  fecha: string // ISO, cuándo se publicó
  tipo: AvisoTipo
  autor?: string
  ejemplo?: boolean
}

export type Categoria = 'fiestas' | 'deporte' | 'cultura'

export interface Evento {
  id: string
  titulo: string
  /** Texto libre cuando no hay fecha concreta, p. ej. "Fecha por confirmar". */
  cuando: string
  /** AAAA-MM-DD si se conoce. */
  fecha?: string
  lugar?: string
  texto: string
  enlace?: string
  categoria: Categoria
}

export type AvisoInput = Pick<Aviso, 'titulo' | 'texto' | 'tipo'>
export type EventoInput = Omit<Evento, 'id'>

export interface Contenido {
  avisos: Aviso[]
  eventos: Evento[]
}
