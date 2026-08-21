import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { irACapituloPelicula } from "../sections/Pelicula";

type Props = {
  /** Nombre base del loop en /media/loops (recepcion, oficina, archivo…). */
  sala: string;
  /** Descripción corta de la sala para lectores de pantalla. */
  etiqueta: string;
  /** Capítulo de la película al que salta el banner al hacer clic. */
  capitulo: number;
  /** Clases extra del contenedor, p. ej. bordes para secciones oscuras. */
  className?: string;
};

/**
 * Banner ambiental: la sala de la película que corresponde a la sección, en
 * un loop quieto con deriva. `preload="none"` y reproducción sólo en viewport
 * para que las cinco salas no cuesten nada al cargar la página. El banner es
 * un botón: lleva de vuelta al capítulo del recorrido que muestra esa sala.
 */
export default function AmbientLoop({
  sala,
  etiqueta,
  capitulo,
  className,
}: Props) {
  const reducido = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (reducido) return;
    const video = videoRef.current;
    if (!video) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "80px" },
    );
    observador.observe(video);
    return () => observador.disconnect();
  }, [reducido]);

  const poster = `/media/loops/${sala}-poster.jpg`;

  return (
    <button
      aria-label={`Ver ${etiqueta} en el recorrido`}
      className={`relative mt-8 block w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--curia-border)] text-left ${className ?? ""}`}
      onClick={() => irACapituloPelicula(capitulo)}
      type="button"
    >
      {reducido ? (
        <img
          alt=""
          className="curia-deriva block aspect-[21/9] w-full object-cover"
          src={poster}
        />
      ) : (
        <video
          aria-hidden="true"
          className="curia-deriva block aspect-[21/9] w-full object-cover"
          disablePictureInPicture
          loop
          muted
          playsInline
          poster={poster}
          preload="none"
          ref={videoRef}
        >
          <source src={`/media/loops/${sala}-loop.webm`} type="video/webm" />
          <source src={`/media/loops/${sala}-loop.mp4`} type="video/mp4" />
        </video>
      )}
      <span
        aria-hidden="true"
        className="absolute bottom-2.5 right-3 rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm"
      >
        Ver en el recorrido
      </span>
    </button>
  );
}
