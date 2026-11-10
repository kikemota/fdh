import { useState } from 'react'
import { api } from '../api/http'
import type { Aviso, AvisoInput, Categoria, Evento, EventoInput, PublicUser, Role } from '../api/types'
import { useContenido } from '../contenido'
import { href } from '../router'
import { useEditor, useSession } from '../session'
import { BorrarConfirmando, useSubmit } from '../ui'
import { VersionApp } from '../AppVersion'

const ROL: Record<Role, string> = { admin: 'Administrador', editor: 'Editor' }
const TIPO: Record<Aviso['tipo'], string> = { aviso: 'Aviso', bando: 'Bando', urgente: 'Urgente' }
const CATEGORIA: Record<Categoria, string> = { fiestas: 'Fiestas', deporte: 'Deporte', cultura: 'Cultura' }

export function Admin({ seccion }: { seccion?: string }) {
  const me = useEditor()!
  const esAdmin = me.user.role === 'admin'
  const secciones = [
    { id: '', label: 'Avisos' },
    { id: 'eventos', label: 'Eventos' },
    ...(esAdmin ? [{ id: 'personas', label: 'Personas' }] : []),
    { id: 'cuenta', label: 'Mi cuenta' },
  ]
  const actual = secciones.some((s) => s.id === (seccion ?? '')) ? (seccion ?? '') : ''
  return (
    <>
      <header className="page-head">
        <h1>Gestión</h1>
        <span className="chip">{ROL[me.user.role]}</span>
      </header>
      <nav className="subtabs" aria-label="Secciones de gestión">
        {secciones.map((s) => (
          <a key={s.id} href={s.id ? href('admin', s.id) : href('admin')} className={actual === s.id ? 'on' : ''} aria-current={actual === s.id ? 'page' : undefined}>
            {s.label}
          </a>
        ))}
      </nav>
      <div className="stack">
        {actual === '' && <GestionAvisos />}
        {actual === 'eventos' && <GestionEventos />}
        {actual === 'personas' && <Personas />}
        {actual === 'cuenta' && <MiCuenta />}
      </div>
    </>
  )
}

// ---------- Avisos ----------

const avisoVacio: AvisoInput = { titulo: '', texto: '', tipo: 'aviso' }

function FormAviso({ inicial, onGuardar, onCancelar }: { inicial: AvisoInput; onGuardar: (a: AvisoInput) => Promise<void>; onCancelar?: () => void }) {
  const [a, setA] = useState(inicial)
  const { busy, error, run } = useSubmit(async () => {
    await onGuardar(a)
    if (!onCancelar) setA(avisoVacio)
  })
  return (
    <form className="card form" onSubmit={run}>
      {!onCancelar && <h2>Publicar aviso</h2>}
      <label>
        Tipo
        <select id="av-tipo" value={a.tipo} onChange={(e) => setA({ ...a, tipo: e.target.value as Aviso['tipo'] })}>
          {Object.entries(TIPO).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label>
        Título
        <input id="av-titulo" value={a.titulo} onChange={(e) => setA({ ...a, titulo: e.target.value })} maxLength={120} />
      </label>
      <label>
        Texto
        <textarea id="av-texto" value={a.texto} onChange={(e) => setA({ ...a, texto: e.target.value })} rows={4} />
      </label>
      {error && (
        <p className="small warn" role="alert">
          {error}
        </p>
      )}
      <div className="acciones">
        <button className="btn" type="submit" disabled={busy || !a.titulo.trim()}>
          {busy ? 'Guardando…' : onCancelar ? 'Guardar cambios' : 'Publicar'}
        </button>
        {onCancelar && (
          <button type="button" className="link-sm" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

function GestionAvisos() {
  const { avisos, recargar } = useContenido()
  const [editando, setEditando] = useState<string | null>(null)
  const [hecho, setHecho] = useState<string | null>(null)
  return (
    <>
      <FormAviso
        inicial={avisoVacio}
        onGuardar={async (a) => {
          await api.crearAviso(a)
          await recargar()
          setHecho('Aviso publicado. Ya lo ve todo el pueblo.')
        }}
      />
      {hecho && (
        <p className="ok small" role="status">
          {hecho}
        </p>
      )}
      <h2 className="seccion-titulo">Publicados</h2>
      {avisos.map((a) =>
        editando === a.id ? (
          <FormAviso
            key={a.id}
            inicial={{ titulo: a.titulo, texto: a.texto, tipo: a.tipo }}
            onCancelar={() => setEditando(null)}
            onGuardar={async (nuevo) => {
              await api.editarAviso(a.id, nuevo)
              await recargar()
              setEditando(null)
            }}
          />
        ) : (
          <article className="card fila" key={a.id}>
            <div className="fila-texto">
              <span className={`chip chip-${a.tipo}`}>{TIPO[a.tipo]}</span>
              <h3>{a.titulo}</h3>
              <p className="muted small">
                {new Date(a.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                {a.autor ? ` · ${a.autor}` : ''}
              </p>
            </div>
            <div className="acciones">
              <button type="button" className="link-sm" onClick={() => setEditando(a.id)}>
                Editar
              </button>
              <BorrarConfirmando
                onConfirm={async () => {
                  await api.borrarAviso(a.id)
                  await recargar()
                }}
              />
            </div>
          </article>
        ),
      )}
    </>
  )
}

// ---------- Eventos ----------

const eventoVacio: EventoInput = { titulo: '', cuando: '', fecha: '', lugar: 'Fuentelespino de Haro', texto: '', enlace: '', categoria: 'fiestas' }

function FormEvento({ inicial, onGuardar, onCancelar }: { inicial: EventoInput; onGuardar: (e: EventoInput) => Promise<void>; onCancelar?: () => void }) {
  const [e, setE] = useState(inicial)
  const { busy, error, run } = useSubmit(async () => {
    await onGuardar(e)
    if (!onCancelar) setE(eventoVacio)
  })
  const set = (k: keyof EventoInput) => (ev: { target: { value: string } }) => setE({ ...e, [k]: ev.target.value })
  return (
    <form className="card form" onSubmit={run}>
      {!onCancelar && <h2>Nuevo evento</h2>}
      <label>
        Título
        <input id="ev-titulo" value={e.titulo} onChange={set('titulo')} maxLength={120} />
      </label>
      <div className="dos-col">
        <label>
          Fecha
          <input id="ev-fecha" type="date" value={e.fecha ?? ''} onChange={set('fecha')} />
        </label>
        <label>
          Categoría
          <select id="ev-cat" value={e.categoria} onChange={set('categoria')}>
            {Object.entries(CATEGORIA).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {e.fecha ? 'Horario o detalle (opcional)' : 'Cuándo (si aún no hay fecha)'}
        <input id="ev-cuando" value={e.cuando} onChange={set('cuando')} placeholder={e.fecha ? 'A las 18:00' : 'Fecha por confirmar'} maxLength={120} />
      </label>
      <label>
        Lugar
        <input id="ev-lugar" value={e.lugar ?? ''} onChange={set('lugar')} maxLength={120} />
      </label>
      <label>
        Descripción
        <textarea id="ev-texto" value={e.texto} onChange={set('texto')} rows={3} />
      </label>
      <label>
        Enlace (opcional)
        <input id="ev-enlace" type="url" value={e.enlace ?? ''} onChange={set('enlace')} placeholder="https://" />
      </label>
      {error && (
        <p className="small warn" role="alert">
          {error}
        </p>
      )}
      <div className="acciones">
        <button className="btn" type="submit" disabled={busy || !e.titulo.trim()}>
          {busy ? 'Guardando…' : onCancelar ? 'Guardar cambios' : 'Añadir a la agenda'}
        </button>
        {onCancelar && (
          <button type="button" className="link-sm" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

const aInput = (e: Evento): EventoInput => ({
  titulo: e.titulo,
  cuando: e.cuando === 'Fecha por confirmar' ? '' : e.cuando,
  fecha: e.fecha ?? '',
  lugar: e.lugar ?? '',
  texto: e.texto,
  enlace: e.enlace ?? '',
  categoria: e.categoria,
})

function GestionEventos() {
  const { eventos, recargar } = useContenido()
  const [editando, setEditando] = useState<string | null>(null)
  const [hecho, setHecho] = useState<string | null>(null)
  return (
    <>
      <FormEvento
        inicial={eventoVacio}
        onGuardar={async (e) => {
          await api.crearEvento(e)
          await recargar()
          setHecho('Evento añadido a la agenda.')
        }}
      />
      {hecho && (
        <p className="ok small" role="status">
          {hecho}
        </p>
      )}
      <h2 className="seccion-titulo">En la agenda</h2>
      {eventos.map((e) =>
        editando === e.id ? (
          <FormEvento
            key={e.id}
            inicial={aInput(e)}
            onCancelar={() => setEditando(null)}
            onGuardar={async (nuevo) => {
              await api.editarEvento(e.id, nuevo)
              await recargar()
              setEditando(null)
            }}
          />
        ) : (
          <article className="card fila" key={e.id}>
            <div className="fila-texto">
              <span className={`chip chip-${e.categoria}`}>{CATEGORIA[e.categoria]}</span>
              <h3>{e.titulo}</h3>
              <p className="muted small">{e.fecha ? new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : e.cuando}</p>
            </div>
            <div className="acciones">
              <button type="button" className="link-sm" onClick={() => setEditando(e.id)}>
                Editar
              </button>
              <BorrarConfirmando
                onConfirm={async () => {
                  await api.borrarEvento(e.id)
                  await recargar()
                }}
              />
            </div>
          </article>
        ),
      )}
    </>
  )
}

// ---------- Personas ----------

function Personas() {
  const me = useEditor()!
  const { refresh } = useSession()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('editor')
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { busy, error, run } = useSubmit(async () => {
    setLink(null)
    setCopied(false)
    const res = await api.invite(email, role)
    setLink(`${window.location.origin}${window.location.pathname}#/invitacion/${res.token}`)
    setEmail('')
  })
  const people = me.people ?? []
  return (
    <>
      <form className="card form" onSubmit={run}>
        <h2>Invitar</h2>
        <p className="small muted">Crea un enlace de invitación y envíalo por WhatsApp o correo. Sirve una vez y caduca en 14 días.</p>
        <label>
          Correo
          <input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Rol
          <select id="p-rol" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="editor">Editor: publica avisos y eventos</option>
            <option value="admin">Administrador: además gestiona personas</option>
          </select>
        </label>
        {error && <p className="small warn">{error}</p>}
        <button className="btn" type="submit" disabled={busy || !email.includes('@')}>
          Crear enlace de invitación
        </button>
        {link && (
          <div className="notice">
            <p className="small">Envía este enlace:</p>
            <p className="link-box">{link}</p>
            <button
              className="btn btn-sm"
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(link).then(
                  () => setCopied(true),
                  () => {},
                )
              }
            >
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
          </div>
        )}
      </form>
      <section className="card">
        <h2>Personas con acceso</h2>
        <ul className="lista">
          {people.map((p) => (
            <Persona key={p.id} persona={p} soyYo={p.id === me.user.id} onChanged={refresh} />
          ))}
        </ul>
      </section>
    </>
  )
}

function Persona({ persona, soyYo, onChanged }: { persona: PublicUser; soyYo: boolean; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  return (
    <li>
      <div>
        <strong>{persona.name}</strong>
        <p className="muted small">{persona.email}</p>
      </div>
      {soyYo ? (
        <span className="chip">{ROL[persona.role]} (tú)</span>
      ) : (
        <div className="tels">
          <label>
            <span className="sr-only">Rol de {persona.name}</span>
            <select
              className="select-sm"
              value={persona.role}
              disabled={busy}
              onChange={async (e) => {
                setBusy(true)
                try {
                  await api.setRole(persona.id, e.target.value as Role)
                  await onChanged()
                } finally {
                  setBusy(false)
                }
              }}
            >
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <BorrarConfirmando
            etiqueta="Quitar acceso"
            onConfirm={async () => {
              await api.removePerson(persona.id)
              await onChanged()
            }}
          />
        </div>
      )}
    </li>
  )
}

// ---------- Mi cuenta ----------

function MiCuenta() {
  const me = useEditor()!
  const { refresh, signOut } = useSession()
  const [name, setName] = useState(me.user.name)
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [hecho, setHecho] = useState<string | null>(null)
  const nombre = useSubmit(async () => {
    await api.updateMe({ name })
    await refresh()
    setHecho('Nombre guardado.')
  })
  const clave = useSubmit(async () => {
    await api.updateMe({ password: nueva, currentPassword: actual })
    setActual('')
    setNueva('')
    setHecho('Contraseña cambiada.')
  })
  const todos = useSubmit(async () => {
    await api.logoutEverywhere()
    signOut()
  })
  return (
    <>
      {hecho && (
        <p className="ok small" role="status">
          {hecho}
        </p>
      )}
      <form className="card form" onSubmit={nombre.run}>
        <h2>Tu nombre</h2>
        <p className="small muted">{me.user.email}</p>
        <label>
          Nombre que firma los avisos
          <input id="mc-name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {nombre.error && <p className="small warn">{nombre.error}</p>}
        <button className="btn" type="submit" disabled={nombre.busy || !name.trim() || name === me.user.name}>
          Guardar nombre
        </button>
      </form>
      <form className="card form" onSubmit={clave.run}>
        <h2>Cambiar contraseña</h2>
        <label>
          Contraseña actual
          <input id="mc-actual" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} />
        </label>
        <label>
          Contraseña nueva (al menos 10 caracteres)
          <input id="mc-nueva" type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        </label>
        {clave.error && <p className="small warn">{clave.error}</p>}
        <button className="btn" type="submit" disabled={clave.busy || !actual || nueva.length < 10}>
          Cambiar contraseña
        </button>
      </form>
      <section className="card form">
        <h2>Sesión</h2>
        <div className="acciones">
          <button className="btn" type="button" onClick={signOut}>
            Cerrar sesión
          </button>
          <button className="link-sm" type="button" disabled={todos.busy} onClick={() => void todos.run()}>
            Cerrar sesión en todos los dispositivos
          </button>
        </div>
        {todos.error && <p className="small warn">{todos.error}</p>}
      </section>
      <VersionApp />
    </>
  )
}
