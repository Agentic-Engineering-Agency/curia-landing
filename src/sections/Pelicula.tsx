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

// La URL de blob se cachea a nivel de módulo y nunca se revoca: la película
// es la apertura de la página y vive lo que ella. Revocar al desmontar rompe
// el doble montaje de StrictMode (el src queda apuntando a un blob muerto).
let peliculaEnBlob: Promise<string | null> | null = null;

export default function Pelicula() {
  const reducido = useReducedMotion();
  const pistaRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrubRef = useRef<Scrub | null>(null);
  const [capitulo, setCapitulo] = useState(0);

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
      peliculaEnBlob ??= blobDeVideo(video);
      const url = await peliculaEnBlob;
      if (!vivo) return;
      if (url) video.src = url;
      const scrub = crearScrub({
        video,
        pista,
        alCambiarCapitulo: setCapitulo,
      });
      scrubRef.current = scrub;
      scrub.arrancar();
    })();

    return () => {
      vivo = false;
      scrubRef.current?.detener();
      scrubRef.current = null;
    };
  }, [reducido]);

  const cap = CAPITULOS[capitulo];
  const ctaVisible = reducido || capitulo === CAPITULOS.length - 1;

  return (
    <section
      aria-label="Recorrido del despacho"
      className="pel-pista"
      ref={pistaRef}
      style={ESTILO_PISTA}
    >
      <div className="pel-escena">
        {reducido ? (
          <img
            alt=""
            aria-hidden="true"
            className="pel-poster"
            src="/media/despacho-poster.jpg"
          />
        ) : (
          <video
            aria-hidden="true"
            disablePictureInPicture
            muted
            playsInline
            poster="/media/despacho-poster.jpg"
            preload="auto"
            ref={videoRef}
          >
            <source src="/media/despacho-scrub.webm" type="video/webm" />
            <source src="/media/despacho-scrub.mp4" type="video/mp4" />
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
