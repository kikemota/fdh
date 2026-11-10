import { useMemo, useState } from 'react'
import type { Evento } from './api/types'
import { useContenido } from './contenido'

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const CATEGORIA: Record<Evento['categoria'], string> = { fiestas: 'Fiestas', deporte: 'Deporte', cultura: 'Cultura' }

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hoyIso = () => iso(new Date())

function fechaLarga(f: string) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Archivo .ics para añadir el evento al calendario del móvil
function icsHref(e: Evento) {
  if (!e.fecha) return undefined
  const ini = e.fecha.replaceAll('-', '')
  const finDate = new Date(e.fecha + 'T12:00:00')
  finDate.setDate(finDate.getDate() + 1)
  const fin = iso(finDate).replaceAll('-', '')
  const esc = (s: string) => s.replace(/[,;\\]/g, (c) => '\\' + c).replace(/\n/g, '\\n')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fuentelespino de Haro//App//ES',
    'BEGIN:VEVENT',
    `UID:${e.id}@fuentelespinodeharo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${ini}`,
    `DTEND;VALUE=DATE:${fin}`,
    `SUMMARY:${esc(e.titulo)}`,
    `DESCRIPTION:${esc(e.texto + (e.enlace ? '\n' + e.enlace : ''))}`,
    `LOCATION:${esc(e.lugar ?? 'Fuentelespino de Haro, Cuenca')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)
}

function TarjetaEvento({ e }: { e: Evento }) {
  const ics = icsHref(e)
  return (
    <article className="card evento">
      <span className={`chip chip-${e.categoria}`}>{CATEGORIA[e.categoria]}</span>
      <h3>{e.titulo}</h3>
      <p className="evento-cuando">
        {e.fecha ? fechaLarga(e.fecha) : e.cuando}
        {e.fecha && e.cuando ? <span className="muted"> · {e.cuando}</span> : null}
      </p>
      {e.lugar && <p className="muted small">{e.lugar}</p>}
      <p>{e.texto}</p>
      <div className="evento-acciones">
        {ics && (
          <a className="btn btn-sm" href={ics} download={`${e.id}.ics`}>
            Añadir a mi calendario
          </a>
        )}
        {e.enlace && (
          <a href={e.enlace} target="_blank" rel="noreferrer" className="link-sm">
            Más información ↗
          </a>
        )}
      </div>
    </article>
  )
}

export default function Agenda() {
  const { eventos: EVENTOS } = useContenido()
  const hoy = hoyIso()
  const [mes, setMes] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [sel, setSel] = useState<string | null>(null)

  const porDia = useMemo(() => {
    const m = new Map<string, Evento[]>()
    for (const e of EVENTOS) if (e.fecha) m.set(e.fecha, [...(m.get(e.fecha) ?? []), e])
    return m
  }, [EVENTOS])
  const sinFecha = EVENTOS.filter((e) => !e.fecha)

  // Celdas del mes, empezando en lunes
  const celdas = useMemo(() => {
    const primero = (mes.getDay() + 6) % 7
    const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
    const out: (string | null)[] = Array(primero).fill(null)
    for (let d = 1; d <= diasMes; d++) out.push(iso(new Date(mes.getFullYear(), mes.getMonth(), d)))
    while (out.length % 7) out.push(null)
    return out
  }, [mes])

  const prefijoMes = iso(mes).slice(0, 7)
  const delMes = EVENTOS.filter((e) => e.fecha?.startsWith(prefijoMes)).sort((a, b) => a.fecha!.localeCompare(b.fecha!))
  const proximo = EVENTOS.filter((e) => e.fecha && e.fecha >= hoy).sort((a, b) => a.fecha!.localeCompare(b.fecha!))[0]

  const mover = (n: number) => {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1))
    setSel(null)
  }
  const irA = (f: string) => {
    const d = new Date(f + 'T12:00:00')
    setMes(new Date(d.getFullYear(), d.getMonth(), 1))
    setSel(f)
  }

  const lista = sel ? (porDia.get(sel) ?? []) : delMes
  const tituloMes = mes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <>
      <header className="page-head">
        <h1>Agenda</h1>
      </header>
      <div className="stack">
        <section className="card cal">
          <div className="cal-head">
            <button className="cal-nav" onClick={() => mover(-1)} aria-label="Mes anterior">
              ‹
            </button>
            <h2 className="cal-mes">{tituloMes}</h2>
            <button className="cal-nav" onClick={() => mover(1)} aria-label="Mes siguiente">
              ›
            </button>
          </div>
          <div className="cal-grid" role="grid">
            {DIAS.map((d) => (
              <span key={d} className="cal-dow">
                {d}
              </span>
            ))}
            {celdas.map((f, i) => {
              if (!f) return <span key={i} />
              const evs = porDia.get(f)
              const cls = ['cal-dia', f === hoy && 'hoy', f === sel && 'sel', evs && 'con-evento'].filter(Boolean).join(' ')
              return (
                <button key={f} className={cls} onClick={() => setSel(sel === f ? null : f)} aria-label={`${fechaLarga(f)}${evs ? `, ${evs.length} evento` : ''}`}>
                  <span>{Number(f.slice(8))}</span>
                  {evs && (
                    <span className="cal-puntos">
                      {evs.map((e) => (
                        <i key={e.id} className={`punto punto-${e.categoria}`} />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {prefijoMes !== hoy.slice(0, 7) ? (
            <button className="link-sm cal-hoy" onClick={() => irA(hoy)}>
              Volver a hoy
            </button>
          ) : null}
        </section>

        <h2 className="seccion-titulo">{sel ? fechaLarga(sel) : `Eventos de ${mes.toLocaleDateString('es-ES', { month: 'long' })}`}</h2>
        {lista.length ? (
          lista.map((e) => <TarjetaEvento key={e.id} e={e} />)
        ) : (
          <div className="card vacio">
            <p className="muted">{sel ? 'No hay eventos este día.' : 'No hay eventos este mes.'}</p>
            {proximo && (
              <button className="link-sm" onClick={() => irA(proximo.fecha!)}>
                Ver el próximo: {proximo.titulo}, {fechaLarga(proximo.fecha!)} →
              </button>
            )}
          </div>
        )}

        {sinFecha.length > 0 && (
          <>
            <h2 className="seccion-titulo">Fecha por confirmar</h2>
            {sinFecha.map((e) => (
              <TarjetaEvento key={e.id} e={e} />
            ))}
          </>
        )}
      </div>
    </>
  )
}
