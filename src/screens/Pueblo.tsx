import type { ReactNode } from 'react'
import { PUEBLO } from '../data'
import {
  ALOJAMIENTO_FUENTE,
  ALOJAMIENTOS,
  CRONOLOGIA,
  HISTORIA,
  HISTORIA_FUENTE,
  HISTORIA_INTRO,
  PERSONAJES_FAMOSOS,
  PERSONAJES_FUENTE,
  PERSONAJES_HISTORICOS,
  VIDEOS_FUENTE,
  VIDEOS_PROMOCIONALES,
  VIDEOS_VARIOS,
  type Personaje,
} from '../pueblo'
import { href } from '../router'
import { VideoYT } from '../Video'

const telFormato = (n: string) => (n.length === 9 ? `${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}` : n)

function Pagina({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <>
      <header className="page-head">
        <a className="back" href={href('pueblo')} aria-label="Volver a El pueblo">
          ←
        </a>
        <h1>{titulo}</h1>
      </header>
      <div className="stack">{children}</div>
    </>
  )
}

function Fuente({ url, texto = 'Fuente: fuentelespinodeharo.net' }: { url: string; texto?: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="link-sm fuente">
      {texto} ↗
    </a>
  )
}

function Historia() {
  return (
    <Pagina titulo="Historia">
      <p className="entradilla">{HISTORIA_INTRO}</p>
      <section className="card">
        <h2>De un vistazo</h2>
        <ol className="cronologia">
          {CRONOLOGIA.map((c) => (
            <li key={c.cuando}>
              <span className="crono-cuando">{c.cuando}</span>
              <span>{c.que}</span>
            </li>
          ))}
        </ol>
      </section>
      {HISTORIA.map((cap) => (
        <article className="card prose" key={cap.titulo}>
          <h2>{cap.titulo}</h2>
          {cap.parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      ))}
      <p className="muted small">
        Basado en «{HISTORIA_FUENTE.libro}», de {HISTORIA_FUENTE.autor}.
      </p>
      <Fuente url={HISTORIA_FUENTE.url} />
    </Pagina>
  )
}

function FichaPersonaje({ p }: { p: Personaje }) {
  const iniciales = p.nombre
    .split(' ')
    .filter((w) => w[0] === w[0]?.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return (
    <details className="card personaje" id={p.id}>
      <summary>
        <span className="avatar" aria-hidden="true">
          {iniciales}
        </span>
        <span className="personaje-cab">
          <strong>{p.nombre}</strong>
          <span className="muted small">{p.lema}</span>
          <span className="muted small">{p.epoca}</span>
        </span>
      </summary>
      <div className="prose personaje-bio">
        {p.bio.map((b, i) => (
          <p key={i}>{b}</p>
        ))}
        {p.enlace && <Fuente url={p.enlace} texto="Más información" />}
      </div>
    </details>
  )
}

function Personajes() {
  return (
    <Pagina titulo="Personajes">
      <h2 className="seccion-titulo">En la historia</h2>
      {PERSONAJES_HISTORICOS.map((p) => (
        <FichaPersonaje key={p.id} p={p} />
      ))}
      <h2 className="seccion-titulo">Con raíces en el pueblo</h2>
      <p className="muted small">Personas conocidas que descienden de familias de Fuentelespino de Haro.</p>
      {PERSONAJES_FAMOSOS.map((p) => (
        <FichaPersonaje key={p.id} p={p} />
      ))}
      <Fuente url={PERSONAJES_FUENTE} />
    </Pagina>
  )
}

function Videos() {
  return (
    <Pagina titulo="Vídeos">
      <h2 className="seccion-titulo">Vídeos promocionales</h2>
      {VIDEOS_PROMOCIONALES.map((v) => (
        <VideoYT key={v.id} video={v} />
      ))}
      <h2 className="seccion-titulo">Más vídeos del pueblo</h2>
      {VIDEOS_VARIOS.map((v) => (
        <VideoYT key={v.id} video={v} />
      ))}
      <p className="muted small">¿Tienes un vídeo del pueblo? Súbelo a YouTube y envía el enlace a la web del pueblo.</p>
      <Fuente url={VIDEOS_FUENTE} />
    </Pagina>
  )
}

function Alojarse() {
  return (
    <Pagina titulo="Dónde alojarse">
      {ALOJAMIENTOS.map((a) => (
        <div className="stack" key={a.nombre}>
          <section className="card">
            <span className="chip">{a.tipo}</span>
            <h2 className="aloj-nombre">{a.nombre}</h2>
            <p>{a.resumen}</p>
            <div className="acciones aloj-contacto">
              {a.telefonos.map((t) => (
                <a key={t} className="tel" href={`tel:${t}`}>
                  {telFormato(t)}
                </a>
              ))}
              {a.web && (
                <a className="link-sm" href={a.web} target="_blank" rel="noreferrer">
                  Web ↗
                </a>
              )}
            </div>
            {a.gerencia && <p className="muted small">Gerencia: {a.gerencia}</p>}
            <p className="muted small">Precios y descuentos: consultar en recepción.</p>
          </section>
          <section className="card">
            <h2>Cada casa</h2>
            <ul className="viñetas">
              {a.casas.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2>En el complejo</h2>
            <div className="etiquetas">
              {a.servicios.map((x) => (
                <span key={x} className="etiqueta">
                  {x}
                </span>
              ))}
            </div>
            <h3>Actividades</h3>
            <div className="etiquetas">
              {a.actividades.map((x) => (
                <span key={x} className="etiqueta">
                  {x}
                </span>
              ))}
            </div>
            {a.extras.map((e) => (
              <div key={e.titulo}>
                <h3>{e.titulo}</h3>
                <p className="small">{e.texto}</p>
              </div>
            ))}
          </section>
          <section className="card">
            <h2>Para visitar cerca</h2>
            <ul className="lista">
              {a.cerca.map((c) => (
                <li key={c.lugar}>
                  <strong>{c.lugar}</strong>
                  <span className="km">{c.km} km</span>
                </li>
              ))}
            </ul>
          </section>
          {a.videos.map((v) => (
            <VideoYT key={v.id} video={v} />
          ))}
        </div>
      ))}
      <Fuente url={ALOJAMIENTO_FUENTE} />
    </Pagina>
  )
}

export function PuebloDetalle({ sub }: { sub: string }) {
  if (sub === 'historia') return <Historia />
  if (sub === 'personajes') return <Personajes />
  if (sub === 'videos') return <Videos />
  if (sub === 'alojarse') return <Alojarse />
  const s = PUEBLO.find((x) => x.id === sub)
  if (!s) return <Historia />
  return (
    <Pagina titulo={s.titulo}>
      <article className="card prose">
        {s.parrafos.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {s.fuente && <Fuente url={s.fuente} />}
      </article>
    </Pagina>
  )
}

export const SECCIONES_PUEBLO = [
  { id: 'historia', titulo: 'Historia', resumen: 'De la Fuente del Espino a villa independiente en 1673.' },
  { id: 'personajes', titulo: 'Personajes', resumen: 'Del Condestable Iranzo a Pilar Rubio y Ana Pastor.' },
  { id: 'videos', titulo: 'Vídeos', resumen: 'Los vídeos promocionales del pueblo.' },
  { id: 'alojarse', titulo: 'Dónde alojarse', resumen: 'Casas rurales de El Cerrete de Haro.' },
  ...PUEBLO.map((s) => ({ id: s.id, titulo: s.titulo, resumen: s.resumen })),
]
