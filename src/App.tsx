import { useEffect, useMemo, useState } from 'react'
import {
  ALREDEDORES,
  AEMET_URL,
  AVISOS_INICIALES,
  COORDS,
  EVENTOS,
  GRUPOS_TEL,
  PUEBLO,
  REDES,
  TELEFONOS,
  type Aviso,
  type Seccion,
} from './data'

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

const STORE_KEY = 'fdh-avisos-v1'
function cargarAvisos(): Aviso[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw) as Aviso[]
  } catch {
    /* sin almacenamiento: usamos los iniciales */
  }
  return AVISOS_INICIALES
}
function guardarAvisos(a: Aviso[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(a))
  } catch {
    /* ignorar */
  }
}

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
      </div>
      <h3>{a.titulo}</h3>
      <p>{a.texto}</p>
    </article>
  )
}

function Inicio({ avisos, ir }: { avisos: Aviso[]; ir: (t: Tab) => void }) {
  const proximo = EVENTOS.filter((e) => e.fecha).sort((a, b) => a.fecha!.localeCompare(b.fecha!))[0]
  return (
    <>
      <header className="hero">
        <p className="hero-kicker">Cuenca · La Mancha</p>
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
            <p className="muted">{proximo.cuando}</p>
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
      </div>
    </>
  )
}

function Avisos({ avisos, publicar }: { avisos: Aviso[]; publicar: (a: Aviso) => void }) {
  const [abierto, setAbierto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<Aviso['tipo']>('aviso')
  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) return
    publicar({ id: crypto.randomUUID(), titulo: titulo.trim(), texto: texto.trim(), tipo, fecha: new Date().toISOString() })
    setTitulo('')
    setTexto('')
    setTipo('aviso')
    setAbierto(false)
  }
  return (
    <>
      <header className="page-head">
        <h1>Avisos y bandos</h1>
        <button className="btn" onClick={() => setAbierto((v) => !v)}>
          {abierto ? 'Cancelar' : 'Publicar'}
        </button>
      </header>
      <div className="stack">
        {abierto && (
          <form className="card form" onSubmit={enviar}>
            <p className="muted small">Modo demostración: el aviso se guarda solo en este móvil. Con el panel real llegará a todos con una notificación.</p>
            <label>
              Tipo
              <select value={tipo} onChange={(e) => setTipo(e.target.value as Aviso['tipo'])}>
                <option value="aviso">Aviso</option>
                <option value="bando">Bando</option>
                <option value="urgente">Urgente</option>
              </select>
            </label>
            <label>
              Título
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required maxLength={80} />
            </label>
            <label>
              Texto
              <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} />
            </label>
            <button className="btn" type="submit">
              Publicar aviso
            </button>
          </form>
        )}
        {avisos.map((a) => (
          <div className="card" key={a.id}>
            <AvisoItem a={a} />
          </div>
        ))}
      </div>
    </>
  )
}

function Agenda() {
  const ordenados = [...EVENTOS].sort((a, b) => (a.fecha ?? '9999').localeCompare(b.fecha ?? '9999'))
  return (
    <>
      <header className="page-head">
        <h1>Agenda</h1>
      </header>
      <div className="stack">
        {ordenados.map((e) => (
          <article className="card evento" key={e.id}>
            <span className={`chip chip-${e.categoria}`}>{e.categoria === 'fiestas' ? 'Fiestas' : e.categoria === 'deporte' ? 'Deporte' : 'Cultura'}</span>
            <h3>{e.titulo}</h3>
            <p className="evento-cuando">{e.cuando}</p>
            <p>{e.texto}</p>
            {e.enlace && (
              <a href={e.enlace} target="_blank" rel="noreferrer" className="link-sm">
                Más información ↗
              </a>
            )}
          </article>
        ))}
      </div>
    </>
  )
}

function Pueblo() {
  const [sel, setSel] = useState<Seccion | null>(null)
  if (sel)
    return (
      <>
        <header className="page-head">
          <button className="back" onClick={() => setSel(null)} aria-label="Volver">
            ←
          </button>
          <h1>{sel.titulo}</h1>
        </header>
        <article className="card prose">
          {sel.parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {sel.fuente && (
            <a href={sel.fuente} target="_blank" rel="noreferrer" className="link-sm">
              Fuente: fuentelespinodeharo.net ↗
            </a>
          )}
        </article>
      </>
    )
  return (
    <>
      <header className="page-head">
        <h1>El pueblo</h1>
      </header>
      <div className="stack">
        <div className="grid2">
          {PUEBLO.map((s) => (
            <button className="card tile" key={s.id} onClick={() => setSel(s)}>
              <h3>{s.titulo}</h3>
              <p className="muted small">{s.resumen}</p>
            </button>
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
  const [tab, setTab] = useState<Tab>(() => {
    const h = location.hash.slice(1) as Tab
    return TABS.some((t) => t.id === h) ? h : 'inicio'
  })
  const [avisos, setAvisos] = useState<Aviso[]>(cargarAvisos)

  const ir = (t: Tab) => {
    setTab(t)
    history.replaceState(null, '', `#${t}`)
    window.scrollTo(0, 0)
  }
  const publicar = (a: Aviso) => {
    const nuevos = [a, ...avisos]
    setAvisos(nuevos)
    guardarAvisos(nuevos)
  }

  return (
    <div className="app">
      <main>
        {tab === 'inicio' && <Inicio avisos={avisos} ir={ir} />}
        {tab === 'avisos' && <Avisos avisos={avisos} publicar={publicar} />}
        {tab === 'agenda' && <Agenda />}
        {tab === 'pueblo' && <Pueblo />}
        {tab === 'telefonos' && <Telefonos />}
      </main>
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
