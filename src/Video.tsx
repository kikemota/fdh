import { useState } from 'react'
import type { Video } from './pueblo'

/** Vídeo de YouTube que solo se carga al tocarlo (más ligero y sin cookies hasta entonces). */
export function VideoYT({ video, grande }: { video: Video; grande?: boolean }) {
  const [activo, setActivo] = useState(false)
  return (
    <figure className={'video' + (grande ? ' video-grande' : '')}>
      <div className="video-marco">
        {activo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
            title={video.titulo}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="video-portada" onClick={() => setActivo(true)} aria-label={`Reproducir: ${video.titulo}`}>
            <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <strong>{video.titulo}</strong>
        {video.autor && <span className="muted small"> · {video.autor}</span>}
      </figcaption>
    </figure>
  )
}
