import type { Aviso, AvisoInput, Categoria, Contenido, Evento, EventoInput, PublicUser } from '../../src/api/types'
import { AVISOS_INICIALES, EVENTOS_INICIALES } from '../../src/data'
import { badRequest, deny, notFound, now, text, timeKey } from './errors'
import type { KV } from './kv'

// Avisos y eventos. Lectura pública; publican administradores y editores.
// Claves: avisos/{id}  eventos/{id}  meta/sembrado

const TIPOS = ['aviso', 'bando', 'urgente'] as const
const CATEGORIAS: Categoria[] = ['fiestas', 'deporte', 'cultura']

/** La primera vez que se lee, la base de datos se llena con el contenido inicial de la web del pueblo. */
async function sembrar(kv: KV) {
  if (await kv.get('meta/sembrado')) return
  if (!(await kv.create('meta/sembrado', { at: now() }))) return
  await Promise.all([
    ...AVISOS_INICIALES.map((a) => kv.set(`avisos/${a.id}`, a)),
    ...EVENTOS_INICIALES.map((e) => kv.set(`eventos/${e.id}`, e)),
  ])
}

async function todos<T>(kv: KV, prefix: string): Promise<T[]> {
  const keys = await kv.list(prefix)
  const items = await Promise.all(keys.map((k) => kv.get<T>(k)))
  return items.filter((x): x is Awaited<T> & {} => x !== null) as T[]
}

export async function leerContenido(kv: KV): Promise<Contenido> {
  await sembrar(kv)
  const [avisos, eventos] = await Promise.all([todos<Aviso>(kv, 'avisos/'), todos<Evento>(kv, 'eventos/')])
  avisos.sort((a, b) => b.fecha.localeCompare(a.fecha))
  eventos.sort((a, b) => (a.fecha ?? '9999').localeCompare(b.fecha ?? '9999') || a.titulo.localeCompare(b.titulo))
  return { avisos, eventos }
}

function limpiarAviso(p: Partial<AvisoInput>): AvisoInput {
  const titulo = text(p.titulo, 120)
  if (!titulo) throw badRequest('Escribe un título para el aviso.')
  const tipo = TIPOS.includes(p.tipo as AvisoInput['tipo']) ? (p.tipo as AvisoInput['tipo']) : 'aviso'
  return { titulo, texto: text(p.texto, 4000), tipo }
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/

function limpiarEvento(p: Partial<EventoInput>): EventoInput {
  const titulo = text(p.titulo, 120)
  if (!titulo) throw badRequest('Escribe un título para el evento.')
  const fecha = text(p.fecha, 10)
  if (fecha && !FECHA.test(fecha)) throw badRequest('La fecha no es válida.')
  const enlace = text(p.enlace, 500)
  if (enlace && !/^https?:\/\//.test(enlace)) throw badRequest('El enlace debe empezar por https://')
  const categoria = CATEGORIAS.includes(p.categoria as Categoria) ? (p.categoria as Categoria) : 'cultura'
  const e: EventoInput = { titulo, cuando: text(p.cuando, 120) || (fecha ? '' : 'Fecha por confirmar'), texto: text(p.texto, 4000), categoria }
  if (fecha) e.fecha = fecha
  const lugar = text(p.lugar, 120)
  if (lugar) e.lugar = lugar
  if (enlace) e.enlace = enlace
  return e
}

/** Rutas de /avisos y /eventos que modifican contenido (el usuario ya ha iniciado sesión). */
export async function contenidoRoute(kv: KV, me: PublicUser, method: string, coleccion: 'avisos' | 'eventos', id: string | undefined, body: () => Promise<unknown>) {
  if (me.role !== 'admin' && me.role !== 'editor') throw deny()
  const key = (x: string) => `${coleccion}/${x}`

  if (method === 'POST' && !id) {
    const p = (await body()) as Record<string, unknown>
    if (coleccion === 'avisos') {
      const aviso: Aviso = { id: timeKey(), ...limpiarAviso(p), fecha: now(), autor: me.name }
      await kv.set(key(aviso.id), aviso)
      return aviso
    }
    const evento: Evento = { id: timeKey(), ...limpiarEvento(p) }
    await kv.set(key(evento.id), evento)
    return evento
  }
  if (!id) throw notFound()
  const actual = await kv.get<Aviso | Evento>(key(id))
  if (!actual) throw notFound(coleccion === 'avisos' ? 'Ese aviso ya no existe.' : 'Ese evento ya no existe.')

  if (method === 'PUT') {
    const p = (await body()) as Record<string, unknown>
    if (coleccion === 'avisos') {
      const a = actual as Aviso
      const nuevo: Aviso = { id: a.id, fecha: a.fecha, autor: a.autor, ...limpiarAviso(p) }
      await kv.set(key(id), nuevo)
      return nuevo
    }
    const nuevo: Evento = { id, ...limpiarEvento(p) }
    await kv.set(key(id), nuevo)
    return nuevo
  }
  if (method === 'DELETE') {
    await kv.delete(key(id))
    return { ok: true }
  }
  throw notFound()
}
