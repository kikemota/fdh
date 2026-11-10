import { useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/http'
import type { InviteInfo } from '../api/types'
import { href } from '../router'
import { useSession } from '../session'
import { useSubmit } from '../ui'

function AuthLayout({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <>
      <header className="page-head">
        <a className="back" href={href()} aria-label="Volver al inicio">
          ←
        </a>
        <h1>{titulo}</h1>
      </header>
      <div className="stack">{children}</div>
    </>
  )
}

export function SignIn({ message }: { message?: string }) {
  const { signedIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [server, setServer] = useState<{ setupLink: boolean; problem: string | null }>({ setupLink: false, problem: null })
  const { busy, error, run } = useSubmit(async () => signedIn(await api.login(email, password)))

  useEffect(() => {
    api.status().then(
      (s) => {
        const problem = !s.secretOk
          ? 'Falta un ajuste en el servidor: añade SESSION_SECRET (al menos 32 caracteres) en Netlify y vuelve a publicar.'
          : !s.setupDone && !s.setupCodeSet
            ? 'Para crear la primera cuenta, añade FDH_SETUP_CODE en Netlify y vuelve a publicar.'
            : null
        setServer({ setupLink: s.secretOk && !s.setupDone && s.setupCodeSet, problem })
      },
      (e: Error) => setServer({ setupLink: false, problem: `El servidor de Fdh App no responde (${e.message}).` }),
    )
  }, [])

  return (
    <AuthLayout titulo="Acceso para editores">
      <form className="card form" onSubmit={run}>
        <p className="muted small">Para publicar avisos y eventos. Para ver la app no hace falta cuenta.</p>
        {message && <p className="small warn">{message}</p>}
        <label>
          Correo
          <input id="si-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Contraseña
          <input id="si-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && (
          <p className="small warn" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={busy || !email || !password}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="small muted">Las cuentas son por invitación. Si olvidaste la contraseña, pide una invitación nueva al administrador.</p>
      </form>
      {server.problem && <p className="small warn">{server.problem}</p>}
      {server.setupLink && (
        <a className="link-sm" href={href('configurar')}>
          ¿Primera vez? Configura Fdh App
        </a>
      )}
    </AuthLayout>
  )
}

export function Setup() {
  const { signedIn } = useSession()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useSubmit(async () => signedIn(await api.setup({ code, name, email, password })))
  return (
    <AuthLayout titulo="Configurar Fdh App">
      <form className="card form" onSubmit={run}>
        <p className="small muted">Crea la cuenta del primer administrador. Necesitas el código que pusiste en Netlify (FDH_SETUP_CODE).</p>
        <label>
          Código de configuración
          <input id="su-code" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
        </label>
        <label>
          Tu nombre
          <input id="su-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Correo
          <input id="su-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Contraseña (al menos 10 caracteres)
          <input id="su-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && (
          <p className="small warn" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={busy || !code || !name || !email || password.length < 10}>
          {busy ? 'Creando…' : 'Crear administrador'}
        </button>
      </form>
    </AuthLayout>
  )
}

export function AcceptInvite({ token }: { token: string }) {
  const { signedIn } = useSession()
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useSubmit(async () => signedIn(await api.acceptInvite(token, name, password)))

  useEffect(() => {
    api.readInvite(token).then(setInvite, (e: Error) => setLoadError(e.message))
  }, [token])

  return (
    <AuthLayout titulo="Bienvenido a Fdh App">
      <div className="card form">
        {loadError && <p className="small warn">{loadError}</p>}
        {!invite && !loadError && <p className="small muted">Comprobando tu invitación…</p>}
        {invite && (
          <form className="form" onSubmit={run}>
            <p className="small muted">
              {invite.invitedBy} ha invitado a <strong>{invite.email}</strong> como {invite.role === 'admin' ? 'administrador' : 'editor'}. Elige tu contraseña para
              empezar.
            </p>
            <label>
              Tu nombre
              <input id="ai-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Contraseña (al menos 10 caracteres)
              <input id="ai-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error && (
              <p className="small warn" role="alert">
                {error}
              </p>
            )}
            <button className="btn" type="submit" disabled={busy || !name || password.length < 10}>
              {busy ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
