import { useEffect, useRef, useState } from "react";
import { irACapituloPelicula } from "../sections/Pelicula";
import { mediaUrl } from "./media";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

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
  const reducido = usePrefersReducedMotion();
  const marcoRef = useRef<HTMLButtonElement | null>(null);
  const [enZona, setEnZona] = useState(false);
  const [cerca, setCerca] = useState(false);
  const [listo, setListo] = useState(false);

  // Poster y fuentes existen sólo cerca del viewport. Al salir se desmontan
  // otra vez: la caché conserva bytes, pero el decoder libera sus buffers.
  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco) return;
    const observador = new IntersectionObserver(
      ([entrada]) => setEnZona(entrada.isIntersecting),
      { rootMargin: "400px 0px" },
    );
    observador.observe(marco);
    return () => observador.disconnect();
  }, []);

  // Un scroll rápido puede cruzar varias salas en un segundo. Sólo se montan
  // poster/decoder cuando el usuario lleva 180 ms quieto dentro de la zona.
  useEffect(() => {
    if (!enZona) {
      setCerca(false);
      return;
    }
    let temporizador = 0;
    const alReposar = () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => setCerca(true), 180);
    };
    window.addEventListener("scroll", alReposar, { passive: true });
    alReposar();
    return () => {
      window.clearTimeout(temporizador);
      window.removeEventListener("scroll", alReposar);
    };
  }, [enZona]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (reducido) return;
    const video = videoRef.current;
    if (!video) return;
    if (!cerca) {
      video.pause();
      video.load();
      setListo(false);
      return;
    }

    video.style.animationPlayState = "paused";
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          video.style.animationPlayState = "running";
          void video.play().catch(() => {});
        } else {
          video.pause();
          video.style.animationPlayState = "paused";
        }
      },
      { rootMargin: "80px" },
    );
    observador.observe(video);
    return () => {
      observador.disconnect();
      video.pause();
      video.style.animationPlayState = "paused";
    };
  }, [reducido, cerca]);

  const poster = mediaUrl(`/media/loops/${sala}-poster.jpg`);

  return (
    <button
      ref={marcoRef}
      aria-label={`Ver ${etiqueta} en el recorrido`}
      className={`relative mt-8 block w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--curia-border)] text-left ${className ?? ""}`}
      onClick={() => irACapituloPelicula(capitulo)}
      type="button"
    >
      {reducido ? (
        <img
          alt=""
          className="curia-deriva block aspect-[21/9] w-full object-cover"
          decoding="async"
          loading="lazy"
          src={poster}
        />
      ) : (
        <>
          {cerca && (
            <img
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-300 ${listo ? "opacity-0" : "opacity-100"}`}
              decoding="async"
              src={poster}
            />
          )}
          <video
            aria-hidden="true"
            className="curia-deriva block aspect-[21/9] w-full object-cover"
            disablePictureInPicture
            loop
            muted
            onLoadedData={() => setListo(true)}
            playsInline
            preload="none"
            ref={videoRef}
          >
            {cerca && (
              <>
                <source
                  src={mediaUrl(`/media/loops/${sala}-loop.webm`)}
                  type="video/webm"
                />
                <source
                  src={mediaUrl(`/media/loops/${sala}-loop.mp4`)}
                  type="video/mp4"
                />
              </>
            )}
          </video>
        </>
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
