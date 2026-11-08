import type { CreateInviteResponse, InviteInfo, LoginResponse, MeResponse, PublicUser, Role } from '../../src/api/types'
import { bearer, checkPassword, hashPassword, issueToken, passwordProblem, randomId, readToken, type PasswordHash } from './auth'
import { contenidoRoute, leerContenido } from './contenido'
import { badRequest, deny, HttpError, notFound, now, text } from './errors'
import type { KV } from './kv'

// La API de datos de Fdh App: contenido público (avisos y eventos) y cuentas por invitación.
// Claves de las cuentas: users/{id}  emails/{email}  invites/{token}  meta/setup

export interface Env {
  sessionSecret: string
  setupCode?: string
}

interface UserRecord extends PublicUser {
  password: PasswordHash
  sessionVersion: number
  createdAt: string
  invitedById?: string
}

interface InviteRecord extends InviteInfo {
  invitedById: string
  expiresAt: string
}

const INVITE_DAYS = 14

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

const normEmail = (e: unknown) => (typeof e === 'string' ? e.trim().toLowerCase() : '')
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 200
const isRole = (r: unknown): r is Role => r === 'admin' || r === 'editor'
const publicUser = (u: UserRecord): PublicUser => ({ id: u.id, email: u.email, name: u.name, role: u.role })

export async function handle(req: Request, kv: KV, env: Env): Promise<Response> {
  try {
    return await route(req, kv, env)
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status)
    console.error(err)
    return json({ error: 'Algo ha fallado en el servidor.' }, 500)
  }
}

async function body<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T
  } catch {
    throw badRequest('Petición no válida.')
  }
}

async function route(req: Request, kv: KV, env: Env): Promise<Response> {
  const url = new URL(req.url)
  const parts = url.pathname.replace(/^\/api\/v1\/?/, '').split('/').filter(Boolean)
  const m = req.method
  const [a, b, c] = parts

  // Contenido público: no necesita configuración ni sesión.
  if (a === 'contenido' && !b && m === 'GET') return json(await leerContenido(kv))

  const secretOk = !!env.sessionSecret && env.sessionSecret.length >= 32
  // Estado para la pantalla de acceso, para ver qué falta sin abrir los registros de Netlify.
  if (a === 'status' && m === 'GET') {
    const setupDone = !!(await kv.get('meta/setup'))
    return json({ secretOk, setupDone, setupCodeSet: !!env.setupCode })
  }
  if (!secretOk) {
    return json({ error: 'El servidor aún no está configurado: añade SESSION_SECRET (al menos 32 caracteres) en Netlify.' }, 503)
  }

  // Rutas públicas de cuentas
  if (a === 'setup' && m === 'GET') return json({ needed: !(await kv.get('meta/setup')) && !!env.setupCode })
  if (a === 'setup' && m === 'POST') return setup(req, kv, env)
  if (a === 'login' && m === 'POST') return login(req, kv, env)
  if (a === 'invites' && b && !c && m === 'GET') return json(await readInvite(kv, b))
  if (a === 'invites' && b && c === 'accept' && m === 'POST') return acceptInvite(req, kv, env, b)

  // Rutas con sesión iniciada
  const me = await currentUser(req, kv, env)
  if (a === 'me' && m === 'GET') return json(await meResponse(kv, me))
  if (a === 'me' && m === 'PATCH') return updateMe(req, kv, me)
  if (a === 'logout-everywhere' && m === 'POST') {
    await kv.set(`users/${me.id}`, { ...me, sessionVersion: me.sessionVersion + 1 })
    return json({ ok: true })
  }
  if ((a === 'avisos' || a === 'eventos') && !c) {
    const result = await contenidoRoute(kv, publicUser(me), m, a, b, () => body(req))
    return json(result, m === 'POST' ? 201 : 200)
  }
  if (a === 'invites' && !b && m === 'POST') return createInvite(req, kv, me)

  // Administración de personas
  if (a === 'people' && b && !c) {
    if (me.role !== 'admin') throw deny()
    const user = await kv.get<UserRecord>(`users/${b}`)
    if (!user) throw notFound()
    if (user.id === me.id) throw badRequest('No puedes cambiar ni quitar tu propia cuenta desde aquí.')
    if (m === 'PATCH') {
      const p = await body<{ role?: Role }>(req)
      if (p.role && isRole(p.role)) user.role = p.role
      await kv.set(`users/${user.id}`, user)
      return json(publicUser(user))
    }
    if (m === 'DELETE') {
      await kv.delete(`users/${user.id}`)
      await kv.delete(`emails/${user.email}`)
      return json({ ok: true })
    }
  }

  throw notFound()
}

// ---------- cuentas ----------

async function currentUser(req: Request, kv: KV, env: Env): Promise<UserRecord> {
  const token = bearer(req)
  const payload = token ? readToken(token, env.sessionSecret) : null
  if (!payload) throw new HttpError(401, 'Inicia sesión.')
  const user = await kv.get<UserRecord>(`users/${payload.sub}`)
  if (!user || user.sessionVersion !== payload.v) throw new HttpError(401, 'Vuelve a iniciar sesión.')
  return user
}

async function createUser(kv: KV, email: string, name: string, password: string, role: Role, invitedById?: string): Promise<UserRecord> {
  const id = randomId(9)
  if (!(await kv.create(`emails/${email}`, { id }))) throw new HttpError(409, 'Ya existe una cuenta con este correo.')
  const user: UserRecord = { id, email, name, role, password: hashPassword(password), sessionVersion: 1, createdAt: now(), invitedById }
  await kv.set(`users/${id}`, user)
  return user
}

function checkNewAccount(email: string, name: string, password: string) {
  if (!validEmail(email)) throw badRequest('Escribe un correo válido.')
  if (!name) throw badRequest('Escribe tu nombre.')
  const problem = passwordProblem(password)
  if (problem) throw badRequest(problem)
}

async function setup(req: Request, kv: KV, env: Env) {
  const p = await body<{ code?: string; email?: string; name?: string; password?: string }>(req)
  if (!env.setupCode) throw new HttpError(503, 'La configuración inicial no está activada: añade FDH_SETUP_CODE en Netlify.')
  if (p.code !== env.setupCode) throw deny('El código de configuración no es correcto.')
  const email = normEmail(p.email)
  const name = text(p.name, 120)
  const password = typeof p.password === 'string' ? p.password : ''
  checkNewAccount(email, name, password)
  if (!(await kv.create('meta/setup', { at: now() }))) throw deny('Fdh App ya está configurada. Inicia sesión.')
  const user = await createUser(kv, email, name, password, 'admin')
  return json({ token: issueToken(user.id, user.sessionVersion, env.sessionSecret), user: publicUser(user) } satisfies LoginResponse)
}

async function login(req: Request, kv: KV, env: Env) {
  const p = await body<{ email?: string; password?: string }>(req)
  const email = normEmail(p.email)
  const ref = email ? await kv.get<{ id: string }>(`emails/${email}`) : null
  const user = ref ? await kv.get<UserRecord>(`users/${ref.id}`) : null
  // El mismo mensaje tanto si falla el correo como la contraseña.
  if (!user || typeof p.password !== 'string' || !checkPassword(p.password, user.password)) {
    throw new HttpError(401, 'El correo o la contraseña no son correctos.')
  }
  return json({ token: issueToken(user.id, user.sessionVersion, env.sessionSecret), user: publicUser(user) } satisfies LoginResponse)
}

async function updateMe(req: Request, kv: KV, me: UserRecord) {
  const p = await body<{ name?: string; password?: string; currentPassword?: string }>(req)
  if (p.name !== undefined) {
    const name = text(p.name, 120)
    if (!name) throw badRequest('Escribe tu nombre.')
    me.name = name
  }
  if (p.password !== undefined) {
    if (typeof p.currentPassword !== 'string' || !checkPassword(p.currentPassword, me.password)) throw deny('Tu contraseña actual no es correcta.')
    const problem = passwordProblem(p.password)
    if (problem) throw badRequest(problem)
    me.password = hashPassword(p.password)
  }
  await kv.set(`users/${me.id}`, me)
  return json(publicUser(me))
}

async function createInvite(req: Request, kv: KV, me: UserRecord) {
  if (me.role !== 'admin') throw deny('Solo un administrador puede invitar.')
  const p = await body<{ email?: string; role?: Role }>(req)
  const email = normEmail(p.email)
  const role = isRole(p.role) ? p.role : 'editor'
  if (!validEmail(email)) throw badRequest('Escribe un correo válido.')
  if (await kv.get(`emails/${email}`)) throw new HttpError(409, 'Ya existe una cuenta con este correo.')
  const token = randomId(18)
  const invite: InviteRecord = {
    email,
    role,
    invitedBy: me.name,
    invitedById: me.id,
    expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString(),
  }
  await kv.set(`invites/${token}`, invite)
  return json({ token, email, role } satisfies CreateInviteResponse)
}

async function readInvite(kv: KV, token: string): Promise<InviteInfo> {
  const invite = await kv.get<InviteRecord>(`invites/${token}`)
  if (!invite || invite.expiresAt < now()) throw notFound('Esta invitación ha caducado o ya se usó. Pide una nueva.')
  return { email: invite.email, role: invite.role, invitedBy: invite.invitedBy }
}

async function acceptInvite(req: Request, kv: KV, env: Env, token: string) {
  const invite = await kv.get<InviteRecord>(`invites/${token}`)
  if (!invite || invite.expiresAt < now()) throw notFound('Esta invitación ha caducado o ya se usó. Pide una nueva.')
  const p = await body<{ name?: string; password?: string }>(req)
  const name = text(p.name, 120)
  const password = typeof p.password === 'string' ? p.password : ''
  checkNewAccount(invite.email, name, password)
  const user = await createUser(kv, invite.email, name, password, invite.role, invite.invitedById)
  await kv.delete(`invites/${token}`)
  return json({ token: issueToken(user.id, user.sessionVersion, env.sessionSecret), user: publicUser(user) } satisfies LoginResponse)
}

async function allUsers(kv: KV): Promise<UserRecord[]> {
  const keys = await kv.list('users/')
  const users = await Promise.all(keys.map((k) => kv.get<UserRecord>(k)))
  return users.filter((u): u is UserRecord => !!u).sort((x, y) => x.name.localeCompare(y.name))
}

async function meResponse(kv: KV, me: UserRecord): Promise<MeResponse> {
  const res: MeResponse = { user: publicUser(me) }
  if (me.role === 'admin') res.people = (await allUsers(kv)).map(publicUser)
  return res
}
