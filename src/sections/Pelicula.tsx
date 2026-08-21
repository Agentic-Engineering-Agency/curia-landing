import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { CAPITULOS, blobDeVideo, crearScrub } from "../demo-video/scrub";
import type { Scrub } from "../demo-video/scrub";
import "./pelicula.css";

// El alto de la pista es el presupuesto de scroll: un viewport por sala más
// el margen de los tránsitos, el mismo criterio que la página de demo.
const ESTILO_PISTA = {
  "--pel-viewports": String(CAPITULOS.length * 2),
} as CSSProperties;

// La URL de blob se cachea por variante a nivel de módulo y nunca se revoca:
// la película es la apertura de la página y vive lo que ella. Revocar al
// desmontar rompe el doble montaje de StrictMode (src a un blob muerto).
const peliculaEnBlob = new Map<string, Promise<string | null>>();

// Variante móvil: reencuadre 9:16 del mismo máster (608x1080, paneo medido
// que sigue los giros), misma línea de tiempo — las marcas de capítulo valen
// igual. Se elige al montar; un cambio de orientación posterior conserva la
// variante inicial, que sigue siendo válida (el CSS recorta con cover).
// El orden de fuentes importa: en retrato va primero el h264, que los
// teléfonos decodifican por hardware — el scrub es una ráfaga de seeks y
// VP9 por software se traba.
const MEDIOS = {
  ancho: {
    poster: "/media/despacho-poster.jpg",
    fuentes: [
      { src: "/media/despacho-scrub.webm", type: "video/webm" },
      { src: "/media/despacho-scrub.mp4", type: "video/mp4" },
    ],
  },
  retrato: {
    poster: "/media/despacho-poster-movil.jpg",
    fuentes: [
      { src: "/media/despacho-scrub-movil.mp4", type: "video/mp4" },
      { src: "/media/despacho-scrub-movil.webm", type: "video/webm" },
    ],
  },
};

// Registro del scrub y la pista activos para que otras secciones (los
// banners de sala) puedan saltar a un capítulo del recorrido.
let scrubActivo: Scrub | null = null;
let pistaActiva: HTMLElement | null = null;

/** Salta al capítulo indicado; sin scrub (movimiento reducido) va a la pista. */
export function irACapituloPelicula(indice: number) {
  if (scrubActivo) {
    scrubActivo.irACapitulo(indice);
    return;
  }
  pistaActiva?.scrollIntoView({ behavior: "auto" });
}

export default function Pelicula() {
  const reducido = useReducedMotion();
  const pistaRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrubRef = useRef<Scrub | null>(null);
  const [capitulo, setCapitulo] = useState(0);
  const [variante] = useState<keyof typeof MEDIOS>(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-aspect-ratio: 1/1)").matches
      ? "retrato"
      : "ancho",
  );

  useEffect(() => {
    pistaActiva = pistaRef.current;
    return () => {
      if (pistaActiva === pistaRef.current) pistaActiva = null;
    };
  }, []);

  useEffect(() => {
    if (reducido) return;
    const pista = pistaRef.current;
    const video = videoRef.current;
    if (!pista || !video) return;

    let vivo = true;

    // El blob se resuelve antes de arrancar: cambiar la fuente después
    // reiniciaría los metadatos y el driver leería una duración que ya no
    // vale. No es optimización: sin blob, hosts sin Range congelan el scrub.
    (async () => {
      let pendiente = peliculaEnBlob.get(variante);
      if (!pendiente) {
        pendiente = blobDeVideo(video);
        peliculaEnBlob.set(variante, pendiente);
      }
      const url = await pendiente;
      if (!vivo) return;
      if (url) video.src = url;
      const scrub = crearScrub({
        video,
        pista,
        alCambiarCapitulo: setCapitulo,
      });
      scrubRef.current = scrub;
      scrubActivo = scrub;
      scrub.arrancar();
    })();

    return () => {
      vivo = false;
      scrubRef.current?.detener();
      if (scrubActivo === scrubRef.current) scrubActivo = null;
      scrubRef.current = null;
    };
  }, [reducido, variante]);

  const cap = CAPITULOS[capitulo];
  const medios = MEDIOS[variante];
  const ctaVisible = reducido || capitulo === CAPITULOS.length - 1;

  return (
    <section
      aria-label="Recorrido del despacho"
      className="pel-pista"
      ref={pistaRef}
      style={ESTILO_PISTA}
    >
      <div
        className={`pel-escena ${capitulo === CAPITULOS.length - 1 ? "es-final" : ""}`}
      >
        {reducido ? (
          <img
            alt=""
            aria-hidden="true"
            className="pel-poster"
            src={medios.poster}
          />
        ) : (
          <video
            aria-hidden="true"
            disablePictureInPicture
            muted
            playsInline
            poster={medios.poster}
            preload="auto"
            ref={videoRef}
          >
            {medios.fuentes.map((f) => (
              <source key={f.src} src={f.src} type={f.type} />
            ))}
          </video>
        )}

        <div aria-hidden="true" className="pel-velo" />

        <div className="pel-copia">
          <p className="pel-kicker">{cap.kicker}</p>
          <h2 className="pel-titulo">{cap.titulo}</h2>
          <p className="pel-cuerpo">{cap.cuerpo}</p>
          <p className={`pel-cta ${ctaVisible ? "es-visible" : ""}`}>
            <a className="curia-button curia-button-primary" href="#contacto">
              Conversemos sobre tu operación
            </a>
          </p>
        </div>

        {!reducido && (
          <>
            <nav aria-label="Capítulos del recorrido" className="pel-marcas">
              {CAPITULOS.map((c, indice) => (
                <button
                  aria-current={indice === capitulo ? "true" : undefined}
                  aria-label={`Ir a ${c.kicker}`}
                  className={`pel-marca ${indice === capitulo ? "es-activa" : ""}`}
                  key={c.id}
                  onClick={() => scrubRef.current?.irACapitulo(indice)}
                  type="button"
                />
              ))}
            </nav>

            <p className="pel-pie">
              <span>
                {String(capitulo + 1).padStart(2, "0")} /{" "}
                {String(CAPITULOS.length).padStart(2, "0")}
              </span>
              <span>Desplaza para recorrer el despacho</span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
