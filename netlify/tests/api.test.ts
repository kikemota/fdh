// Pruebas de la API con almacenamiento en memoria. Uso: npm run test:api
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handle, type Env } from '../lib/api'
import { memoryKV } from '../lib/kv'

const env: Env = { sessionSecret: 'x'.repeat(40), setupCode: 'setup-123' }
const kv = memoryKV()

async function call(method: string, path: string, body?: unknown, token?: string, e: Env = env) {
  const res = await handle(
    new Request('http://local/api/v1/' + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    kv,
    e,
  )
  return { status: res.status, data: (await res.json()) as any }
}

let admin = '', editora = ''
let editoraId = ''

test('el contenido es público y arranca con el de la web del pueblo', async () => {
  const r = await call('GET', 'contenido', undefined, undefined, { sessionSecret: '' })
  assert.equal(r.status, 200)
  assert.ok(r.data.avisos.length >= 1)
  assert.ok(r.data.eventos.some((e: any) => e.titulo.includes('San Antonio')))
  const again = await call('GET', 'contenido')
  assert.equal(again.data.eventos.length, r.data.eventos.length, 'no se siembra dos veces')
})

test('status dice qué falta', async () => {
  const bad = await call('GET', 'status', undefined, undefined, { sessionSecret: '' })
  assert.deepEqual(bad.data, { secretOk: false, setupDone: false, setupCodeSet: false })
  assert.equal((await call('POST', 'login', { email: 'a@b.es', password: 'x' }, undefined, { sessionSecret: '' })).status, 503)
  assert.deepEqual((await call('GET', 'status')).data, { secretOk: true, setupDone: false, setupCodeSet: true })
})

test('la configuración crea el primer administrador una sola vez', async () => {
  assert.equal((await call('GET', 'setup')).data.needed, true)
  assert.equal((await call('POST', 'setup', { code: 'mal', email: 'kike@x.es', name: 'Kike', password: 'larga12345' })).status, 403)
  assert.equal((await call('POST', 'setup', { code: 'setup-123', email: 'kike@x.es', name: 'Kike', password: 'corta' })).status, 400)
  const ok = await call('POST', 'setup', { code: 'setup-123', email: 'Kike@X.es', name: 'Kike', password: 'larga12345' })
  assert.equal(ok.status, 200)
  assert.equal(ok.data.user.role, 'admin')
  assert.equal(ok.data.user.email, 'kike@x.es')
  admin = ok.data.token
  assert.equal((await call('POST', 'setup', { code: 'setup-123', email: 'b@x.es', name: 'B', password: 'larga12345' })).status, 403)
  assert.equal((await call('GET', 'setup')).data.needed, false)
})

test('inicio de sesión', async () => {
  assert.equal((await call('POST', 'login', { email: 'kike@x.es', password: 'otraclave99' })).status, 401)
  assert.equal((await call('POST', 'login', { email: 'nadie@x.es', password: 'otraclave99' })).status, 401)
  assert.equal((await call('POST', 'login', { email: 'KIKE@x.es', password: 'larga12345' })).status, 200)
  assert.equal((await call('GET', 'me')).status, 401)
  assert.equal((await call('GET', 'me', undefined, 'token.falso')).status, 401)
})

test('invitaciones', async () => {
  const inv = await call('POST', 'invites', { email: 'ana@x.es', role: 'editor' }, admin)
  assert.equal(inv.status, 200)
  assert.equal((await call('GET', 'invites/' + inv.data.token)).data.email, 'ana@x.es')
  const acc = await call('POST', `invites/${inv.data.token}/accept`, { name: 'Ana', password: 'anapass1234' })
  assert.equal(acc.status, 200)
  assert.equal(acc.data.user.role, 'editor')
  editora = acc.data.token
  editoraId = acc.data.user.id
  assert.equal((await call('GET', 'invites/' + inv.data.token)).status, 404, 'la invitación sirve una vez')
  assert.equal((await call('POST', 'invites', { email: 'otro@x.es' }, editora)).status, 403, 'un editor no invita')
  assert.equal((await call('POST', 'invites', { email: 'ana@x.es' }, admin)).status, 409)
  const me = await call('GET', 'me', undefined, admin)
  assert.equal(me.data.people.length, 2)
  assert.equal((await call('GET', 'me', undefined, editora)).data.people, undefined)
})

test('publicar, editar y borrar avisos', async () => {
  assert.equal((await call('POST', 'avisos', { titulo: 'Hola' })).status, 401)
  assert.equal((await call('POST', 'avisos', { titulo: '' }, editora)).status, 400)
  const a = await call('POST', 'avisos', { titulo: 'Corte de agua', texto: 'Martes de 9 a 13', tipo: 'urgente' }, editora)
  assert.equal(a.status, 201)
  assert.equal(a.data.autor, 'Ana')
  let c = await call('GET', 'contenido')
  assert.equal(c.data.avisos[0].titulo, 'Corte de agua', 'el más reciente primero')
  const e = await call('PUT', 'avisos/' + a.data.id, { titulo: 'Corte de agua (aplazado)', tipo: 'aviso' }, admin)
  assert.equal(e.data.titulo, 'Corte de agua (aplazado)')
  assert.equal(e.data.fecha, a.data.fecha)
  assert.equal((await call('DELETE', 'avisos/' + a.data.id, undefined, editora)).status, 200)
  c = await call('GET', 'contenido')
  assert.ok(!c.data.avisos.some((x: any) => x.id === a.data.id))
  assert.equal((await call('PUT', 'avisos/' + a.data.id, { titulo: 'x' }, editora)).status, 404)
})

test('eventos con y sin fecha', async () => {
  assert.equal((await call('POST', 'eventos', { titulo: 'X', fecha: '13/06/2027' }, editora)).status, 400)
  assert.equal((await call('POST', 'eventos', { titulo: 'X', enlace: 'javascript:alert(1)' }, editora)).status, 400)
  const ev = await call('POST', 'eventos', { titulo: 'Iranzada 2027', fecha: '2027-04-18', categoria: 'deporte', texto: 'Marcha' }, editora)
  assert.equal(ev.status, 201)
  const sin = await call('POST', 'eventos', { titulo: 'Concierto' }, editora)
  assert.equal(sin.data.cuando, 'Fecha por confirmar')
  assert.equal(sin.data.categoria, 'cultura')
  const c = await call('GET', 'contenido')
  const idx = (id: string) => c.data.eventos.findIndex((e: any) => e.id === id)
  assert.ok(idx(ev.data.id) < idx(sin.data.id), 'los que tienen fecha van antes')
})

test('administración de personas y cierre de sesión', async () => {
  assert.equal((await call('PATCH', 'people/' + editoraId, { role: 'admin' }, editora)).status, 403)
  assert.equal((await call('PATCH', 'people/' + editoraId, { role: 'admin' }, admin)).data.role, 'admin')
  assert.equal((await call('PATCH', 'me', { password: 'nuevaclave99', currentPassword: 'mal' }, editora)).status, 403)
  assert.equal((await call('PATCH', 'me', { password: 'nuevaclave99', currentPassword: 'anapass1234' }, editora)).status, 200)
  assert.equal((await call('POST', 'login', { email: 'ana@x.es', password: 'nuevaclave99' })).status, 200)
  assert.equal((await call('POST', 'logout-everywhere', undefined, editora)).status, 200)
  assert.equal((await call('GET', 'me', undefined, editora)).status, 401)
  assert.equal((await call('DELETE', 'people/' + editoraId, undefined, admin)).status, 200)
  assert.equal((await call('POST', 'login', { email: 'ana@x.es', password: 'nuevaclave99' })).status, 401)
  const me = await call('GET', 'me', undefined, admin)
  assert.equal(me.data.people.length, 1)
})
