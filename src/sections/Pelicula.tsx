import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CAPITULOS, blobDeVideo, crearScrub } from "../components/scrub";
import type { Scrub } from "../components/scrub";
import { usePrefersReducedMotion } from "../components/usePrefersReducedMotion";
import { mediaUrl } from "../components/media";
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

// Variante móvil: reencuadre 9:16 del mismo máster (608x1080, paneo medido,
// misma línea de tiempo). HEVC se ofrece primero, pero blobDeVideo sólo lo
// acepta cuando MediaCapabilities confirma decode smooth + powerEfficient;
// H264 con GOP 8 queda como ruta universal, VP9 como último fallback.
const MEDIOS = {
  ancho: {
    poster: mediaUrl("/media/despacho-poster.jpg"),
    fuentes: [
      { src: mediaUrl("/media/despacho-scrub.webm"), type: "video/webm" },
      { src: mediaUrl("/media/despacho-scrub.mp4"), type: "video/mp4" },
    ],
  },
  retrato: {
    poster: mediaUrl("/media/despacho-poster-movil.jpg"),
    fuentes: [
      {
        bitrate: 710_000,
        framerate: 24,
        height: 1080,
        requirePowerEfficient: true,
        src: mediaUrl("/media/despacho-scrub-movil-hevc.mp4"),
        type: 'video/mp4; codecs="hvc1.1.6.L93.B0"',
        width: 608,
      },
      {
        src: mediaUrl("/media/despacho-scrub-movil.mp4"),
        type: "video/mp4",
      },
      {
        src: mediaUrl("/media/despacho-scrub-movil.webm"),
        type: "video/webm",
      },
    ],
  },
};

/**
 * Fallback SSR estable de la isla cinematográfica. Conserva exactamente el
 * presupuesto de scroll/sticky y usa <picture> para que el primer HTML ya
 * entregue el poster correcto en 16:9 o 9:16 sin ejecutar JavaScript.
 */
export function PeliculaFallback() {
  const cap = CAPITULOS[0];

  return (
    <section
      aria-label="Recorrido del despacho"
      className="pel-pista"
      style={ESTILO_PISTA}
    >
      <div className="pel-escena">
        <picture>
          <source
            media="(max-aspect-ratio: 1/1)"
            srcSet={MEDIOS.retrato.poster}
          />
          <img
            alt=""
            aria-hidden="true"
            className="pel-poster"
            fetchPriority="high"
            src={MEDIOS.ancho.poster}
          />
        </picture>
        <div aria-hidden="true" className="pel-velo" />
        <div className="pel-copia">
          <p className="pel-kicker">{cap.kicker}</p>
          <h2 className="pel-titulo">{cap.titulo}</h2>
          <p className="pel-cuerpo">{cap.cuerpo}</p>
          <p className="pel-cta">
            <a className="curia-button curia-button-primary" href="#contacto">
              Conversemos sobre tu operación
            </a>
          </p>
        </div>
        <div aria-hidden="true" className="pel-marcas">
          {CAPITULOS.map((c, indice) => (
            <span
              className={`pel-marca ${indice === 0 ? "es-activa" : ""}`}
              key={c.id}
            />
          ))}
        </div>
        <p className="pel-pie">
          <span>01 / {String(CAPITULOS.length).padStart(2, "0")}</span>
          <span>Preparando recorrido</span>
        </p>
      </div>
    </section>
  );
}

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
  const reducido = usePrefersReducedMotion();
  const pistaRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrubRef = useRef<Scrub | null>(null);
  const [capitulo, setCapitulo] = useState(0);
  const [videoListo, setVideoListo] = useState(false);
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

    // El poster/HTML SSR pintan primero. La descarga completa del blob comienza
    // tras load+200 ms o en el primer gesto que indique intención de recorrer;
    // con Data Saver sólo por gesto. Así los 3.43–10.7 MB no compiten con
    // HTML, CSS, fuentes e hidratación.
    let iniciado = false;
    let temporizador = 0;
    const eventos: Array<keyof WindowEventMap> = [
      "pointerdown",
      "touchstart",
      "wheel",
      "scroll",
      "keydown",
    ];

    const limpiarDisparadores = () => {
      window.clearTimeout(temporizador);
      window.removeEventListener("load", alLoad);
      eventos.forEach((evento) => window.removeEventListener(evento, iniciar));
    };

    const cargar = async () => {
      let pendiente = peliculaEnBlob.get(variante);
      if (!pendiente) {
        pendiente = blobDeVideo(video);
        peliculaEnBlob.set(variante, pendiente);
      }
      const url = await pendiente;
      if (!vivo) return;
      if (url) {
        video.src = url;
        video.load();
      }
      const marcarVideoListo = () => {
        if (vivo) setVideoListo(true);
      };
      if (video.readyState >= 1) marcarVideoListo();
      else
        video.addEventListener("loadedmetadata", marcarVideoListo, {
          once: true,
        });
      const scrub = crearScrub({
        video,
        pista,
        alCambiarCapitulo: setCapitulo,
      });
      scrubRef.current = scrub;
      scrubActivo = scrub;
      scrub.arrancar();

      // iOS/WebKit no pinta fotogramas de un video que nunca ha reproducido.
      // El cebado conserva el tiempo: nunca hay autoplay visible.
      const cebar = () => {
        if (!vivo) return;
        const previo = video.currentTime;
        video
          .play()
          .then(() => {
            video.pause();
            video.currentTime = previo;
          })
          .catch(() => {
            const alGesto = () => {
              if (vivo) cebar();
            };
            window.addEventListener("touchstart", alGesto, {
              once: true,
              passive: true,
            });
            window.addEventListener("scroll", alGesto, {
              once: true,
              passive: true,
            });
          });
      };
      if (video.readyState >= 2) cebar();
      else video.addEventListener("canplay", cebar, { once: true });
    };

    function iniciar() {
      if (iniciado || !vivo) return;
      iniciado = true;
      limpiarDisparadores();
      void cargar();
    }

    function alLoad() {
      temporizador = window.setTimeout(iniciar, 200);
    }

    eventos.forEach((evento) =>
      window.addEventListener(evento, iniciar, { once: true, passive: true }),
    );

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (!connection?.saveData) {
      if (document.readyState === "complete") alLoad();
      else window.addEventListener("load", alLoad, { once: true });
    }

    return () => {
      vivo = false;
      limpiarDisparadores();
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
        <img
          alt=""
          aria-hidden="true"
          className="pel-poster"
          fetchPriority="high"
          src={medios.poster}
        />
        {!reducido && (
          <video
            aria-hidden="true"
            disablePictureInPicture
            muted
            playsInline
            preload="none"
            ref={videoRef}
          >
            {medios.fuentes.map((f) => (
              <source
                data-bitrate={"bitrate" in f ? f.bitrate : undefined}
                data-framerate={"framerate" in f ? f.framerate : undefined}
                data-height={"height" in f ? f.height : undefined}
                data-require-power-efficient={
                  "requirePowerEfficient" in f
                    ? String(f.requirePowerEfficient)
                    : undefined
                }
                data-width={"width" in f ? f.width : undefined}
                key={f.src}
                src={f.src}
                type={f.type}
              />
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
              <span>
                {videoListo
                  ? "Desplaza para recorrer el despacho"
                  : "Preparando recorrido"}
              </span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
