import { useEffect, useMemo, useState } from 'react'
import Agenda from './Agenda'
import type { Aviso } from './api/types'
import { AvisoActualizacion, VersionApp } from './AppVersion'
import { ContenidoProvider, useContenido } from './contenido'
import { ALREDEDORES, AEMET_URL, COORDS, GRUPOS_TEL, REDES, TELEFONOS } from './data'
import { VIDEOS_PROMOCIONALES } from './pueblo'
import { PuebloDetalle, SECCIONES_PUEBLO } from './screens/Pueblo'
import { VideoYT } from './Video'
import { href, useRoute } from './router'
import { Admin } from './screens/Admin'
import { AcceptInvite, Setup, SignIn } from './screens/Auth'
import { SessionProvider, useEditor, useSession } from './session'

type Tab = 'inicio' | 'avisos' | 'agenda' | 'pueblo' | 'telefonos'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
  { id: 'avisos', label: 'Avisos', icon: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4' },
  { id: 'agenda', label: 'Agenda', icon: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4' },
  { id: 'pueblo', label: 'El pueblo', icon: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { id: 'telefonos', label: 'Teléfonos', icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2' },
]

function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const hoyIso = () => new Date().toISOString().slice(0, 10)

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function telFormato(n: string) {
  return n.length === 9 ? `${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}` : n
}

// ---------- Tiempo (Open-Meteo, sin clave) ----------
type Tiempo = { temp: number; code: number; max: number; min: number; dias: { d: string; max: number; min: number; code: number }[] }
function descTiempo(code: number): [string, string] {
  if (code === 0) return ['Despejado', '☀️']
  if (code <= 2) return ['Poco nuboso', '🌤️']
  if (code === 3) return ['Nublado', '☁️']
  if (code <= 48) return ['Niebla', '🌫️']
  if (code <= 57) return ['Llovizna', '🌦️']
  if (code <= 67) return ['Lluvia', '🌧️']
  if (code <= 77) return ['Nieve', '❄️']
  if (code <= 82) return ['Chubascos', '🌦️']
  return ['Tormenta', '⛈️']
}
function useTiempo() {
  const [t, setT] = useState<Tiempo | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${COORDS.lat}&longitude=${COORDS.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FMadrid&forecast_days=4`
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) =>
        setT({
          temp: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
          max: Math.round(j.daily.temperature_2m_max[0]),
          min: Math.round(j.daily.temperature_2m_min[0]),
          dias: (j.daily.time as string[]).slice(1).map((d, i) => ({
            d,
            max: Math.round(j.daily.temperature_2m_max[i + 1]),
            min: Math.round(j.daily.temperature_2m_min[i + 1]),
            code: j.daily.weather_code[i + 1],
          })),
        }),
      )
      .catch(() => setError(true))
  }, [])
  return { t, error }
}

function TarjetaTiempo() {
  const { t, error } = useTiempo()
  return (
    <section className="card tiempo">
      <div className="card-head">
        <h2>El tiempo</h2>
        <a href={AEMET_URL} target="_blank" rel="noreferrer" className="link-sm">
          AEMET ↗
        </a>
      </div>
      {t ? (
        <>
          <div className="tiempo-ahora">
            <span className="tiempo-emoji">{descTiempo(t.code)[1]}</span>
            <span className="tiempo-temp">{t.temp}°</span>
            <span className="muted">
              {descTiempo(t.code)[0]}
              <br />
              Máx. {t.max}° · Mín. {t.min}°
            </span>
          </div>
          <div className="tiempo-dias">
            {t.dias.map((d) => (
              <div key={d.d}>
                <span className="muted">{new Date(d.d).toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                <span>{descTiempo(d.code)[1]}</span>
                <span>
                  {d.max}° <span className="muted">{d.min}°</span>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="muted">{error ? 'No se ha podido cargar el tiempo. Consulta la predicción de AEMET.' : 'Cargando…'}</p>
      )}
    </section>
  )
}

// ---------- Pantallas ----------
function AvisoItem({ a }: { a: Aviso }) {
  return (
    <article className={`aviso aviso-${a.tipo}`}>
      <div className="aviso-meta">
        <span className={`chip chip-${a.tipo}`}>{a.tipo === 'urgente' ? 'Urgente' : a.tipo === 'bando' ? 'Bando' : 'Aviso'}</span>
        <span className="muted">{fechaCorta(a.fecha)}</span>
        {a.ejemplo && <span className="chip chip-demo">Ejemplo</span>}
        {a.autor && <span className="muted">· {a.autor}</span>}
      </div>
      <h3>{a.titulo}</h3>
      {a.texto && <p className="pre">{a.texto}</p>}
    </article>
  )
}

function Inicio({ ir }: { ir: (t: Tab) => void }) {
  const { avisos, eventos } = useContenido()
  const editor = useEditor()
  const hoy = hoyIso()
  const proximo = eventos.filter((e) => e.fecha && e.fecha >= hoy).sort((a, b) => a.fecha!.localeCompare(b.fecha!))[0]
  return (
    <>
      <header className="hero">
        <p className="hero-kicker">Fdh App · Cuenca · La Mancha</p>
        <h1>Fuentelespino de Haro</h1>
        <p className="hero-sub">Villa desde 1673</p>
      </header>
      <div className="stack">
        <section className="card">
          <div className="card-head">
            <h2>Último aviso</h2>
            <button className="link-sm" onClick={() => ir('avisos')}>
              Ver todos
            </button>
          </div>
          {avisos[0] ? <AvisoItem a={avisos[0]} /> : <p className="muted">No hay avisos.</p>}
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Conoce el pueblo</h2>
            <a className="link-sm" href={href('pueblo', 'videos')}>
              Más vídeos
            </a>
          </div>
          <VideoYT video={VIDEOS_PROMOCIONALES[0]} grande />
        </section>
        <TarjetaTiempo />
        {proximo && (
          <section className="card">
            <div className="card-head">
              <h2>Próximamente</h2>
              <button className="link-sm" onClick={() => ir('agenda')}>
                Agenda
              </button>
            </div>
            <h3>{proximo.titulo}</h3>
            <p className="muted">{new Date(proximo.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </section>
        )}
        <div className="accesos">
          <button onClick={() => ir('telefonos')}>
            <Icon d={TABS[4].icon} />
            Teléfonos
          </button>
          <a href="tel:967187843">
            <Icon d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
            Llamar al Ayto.
          </a>
          <button onClick={() => ir('pueblo')}>
            <Icon d={TABS[3].icon} />
            Descubre
          </button>
        </div>
        <section className="card">
          <h2>Síguenos</h2>
          <ul className="redes">
            {REDES.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.nombre} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <footer className="pie">
          <a className="link-sm" href={href('admin')}>
            {editor ? `Gestión (${editor.user.name})` : 'Acceso para editores'}
          </a>
          <VersionApp />
        </footer>
      </div>
    </>
  )
}

function Avisos() {
  const { avisos, origen } = useContenido()
  const editor = useEditor()
  return (
    <>
      <header className="page-head">
        <h1>Avisos y bandos</h1>
        {editor && (
          <a className="btn" href={href('admin')}>
            Publicar
          </a>
        )}
      </header>
      <div className="stack">
        {origen !== 'servidor' && <p className="muted small">Sin conexión con el servidor: se muestran los últimos avisos guardados.</p>}
        {avisos.length ? (
          avisos.map((a) => (
            <div className="card" key={a.id}>
              <AvisoItem a={a} />
            </div>
          ))
        ) : (
          <p className="card muted">No hay avisos publicados.</p>
        )}
      </div>
    </>
  )
}

function Pueblo({ sub }: { sub?: string }) {
  if (sub) return <PuebloDetalle sub={sub} />
  return (
    <>
      <header className="page-head">
        <h1>El pueblo</h1>
      </header>
      <div className="stack">
        <div className="grid2">
          {SECCIONES_PUEBLO.map((s) => (
            <a className="card tile" key={s.id} href={href('pueblo', s.id)}>
              <h3>{s.titulo}</h3>
              <p className="muted small">{s.resumen}</p>
            </a>
          ))}
        </div>
        <section className="card">
          <h2>Alrededores</h2>
          <ul className="lista">
            {ALREDEDORES.map((l) => (
              <li key={l.nombre}>
                <div>
                  <strong>{l.nombre}</strong>
                  <p className="muted small">{l.texto}</p>
                </div>
                <span className="km">{l.km} km</span>
              </li>
            ))}
          </ul>
        </section>
        <a className="card mapa" href={`https://www.openstreetmap.org/?mlat=${COORDS.lat}&mlon=${COORDS.lon}#map=14/${COORDS.lat}/${COORDS.lon}`} target="_blank" rel="noreferrer">
          <Icon d={TABS[3].icon} />
          <span>
            <strong>Cómo llegar</strong>
            <span className="muted small"> · Abrir en el mapa ↗</span>
          </span>
        </a>
      </div>
    </>
  )
}

function Telefonos() {
  const grupos = useMemo(() => Object.keys(GRUPOS_TEL) as (keyof typeof GRUPOS_TEL)[], [])
  return (
    <>
      <header className="page-head">
        <h1>Teléfonos de interés</h1>
      </header>
      <div className="stack">
        {grupos.map((g) => (
          <section className="card" key={g}>
            <h2>{GRUPOS_TEL[g]}</h2>
            <ul className="lista">
              {TELEFONOS.filter((t) => t.grupo === g).map((t) => (
                <li key={t.nombre}>
                  <div>
                    <strong>{t.nombre}</strong>
                    {t.nota && <p className="muted small">{t.nota}</p>}
                  </div>
                  <div className="tels">
                    {t.numeros.map((n) => (
                      <a key={n} href={`tel:${n}`} className={`tel ${n === '112' ? 'tel-sos' : ''}`}>
                        {telFormato(n)}
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}

// ---------- App ----------
export default function App() {
  return (
    <SessionProvider>
      <ContenidoProvider>
        <Marco />
      </ContenidoProvider>
    </SessionProvider>
  )
}

function Gestion({ route }: { route: string[] }) {
  const { state } = useSession()
  if (route[0] === 'invitacion' && route[1]) return <AcceptInvite token={route[1]} />
  if (state.kind === 'loading') return <p className="muted page-head">Cargando…</p>
  if (state.kind === 'signedOut') return route[0] === 'configurar' ? <Setup /> : <SignIn message={state.message} />
  return <Admin seccion={route[1]} />
}

function Marco() {
  const route = useRoute()
  const r = route[0] ?? 'inicio'
  const gestion = r === 'admin' || r === 'configurar' || r === 'invitacion'
  const tab: Tab | null = TABS.some((t) => t.id === r) ? (r as Tab) : gestion ? null : 'inicio'
  const ir = (t: Tab) => {
    window.location.hash = t === 'inicio' ? '#/' : href(t)
  }

  return (
    <div className="app">
      <main>
        {gestion && <Gestion route={route} />}
        {tab === 'inicio' && <Inicio ir={ir} />}
        {tab === 'avisos' && <Avisos />}
        {tab === 'agenda' && <Agenda />}
        {tab === 'pueblo' && <Pueblo sub={route[1]} />}
        {tab === 'telefonos' && <Telefonos />}
      </main>
      <AvisoActualizacion />
      <nav className="tabbar" aria-label="Secciones">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => ir(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <Icon d={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
