import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type Props = {
  /** Nombre base del loop en /media/loops (recepcion, oficina, archivo…). */
  sala: string;
  /** Descripción corta de la sala para lectores de pantalla. */
  etiqueta: string;
  /** Clases extra del contenedor, p. ej. bordes para secciones oscuras. */
  className?: string;
};
/**
 * Banner ambiental: la sala de la película que corresponde a la sección, en
 * un loop quieto. `preload="none"` y reproducción sólo en viewport para que
 * las cinco salas no cuesten nada al cargar la página.
 */
export default function AmbientLoop({ sala, etiqueta, className }: Props) {
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
    <div
      aria-label={etiqueta}
      className={`mt-8 overflow-hidden rounded-2xl border border-[var(--curia-border)] ${className ?? ""}`}
      role="img"
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
    </div>
  );
}
