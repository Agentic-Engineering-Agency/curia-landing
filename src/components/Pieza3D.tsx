import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { mediaUrl } from "./media";

// model-viewer llega por CDN al entrar la primera pieza en viewport: three.js
// queda fuera del bundle principal y la landing no paga el visor si nadie
// llega hasta aquí. Los GLB usan Draco; meshopt no carga en model-viewer.
const VISOR_URL =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

let visorPedido = false;

function pedirVisor() {
  if (visorPedido || customElements.get("model-viewer")) return;
  visorPedido = true;
  const script = document.createElement("script");
  script.type = "module";
  script.src = VISOR_URL;
  document.head.append(script);
}

type Props = {
  /** Ruta del GLB (Draco) en /media. */
  src: string;
  /** Render fijo que se muestra mientras carga el modelo. */
  poster: string;
  /** Descripción del objeto. */
  etiqueta: string;
  /** Acimut de reposo en grados; el scroll gira ±giro alrededor de él. */
  acimutBase?: number;
  /** Amplitud del giro por scroll, en grados. */
  giro?: number;
  elevacion?: string;
  distancia?: string;
  className?: string;
};

/**
 * Pieza 3D de marca: objeto de la práctica legal con órbita ligada al scroll.
 * Carga perezosa (visor + GLB sólo al acercarse), poster instantáneo que se
 * retira al evento load, y órbita fija bajo movimiento reducido.
 */
export default function Pieza3D({
  src,
  poster,
  etiqueta,
  acimutBase = 135,
  giro = 28,
  elevacion = "72deg",
  distancia = "105%",
  className,
}: Props) {
  const reducido = usePrefersReducedMotion();
  const marcoRef = useRef<HTMLDivElement | null>(null);
  const visorRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        const cerca = entrada.isIntersecting;
        if (cerca) pedirVisor();
        else setCargado(false);
        setVisible(cerca);
      },
      // 800 px da tiempo a descargar antes de que la pieza entre al viewport,
      // pero la desmonta al alejarse: sólo 1–2 escenas conservan memoria GPU.
      { rootMargin: "800px 0px" },
    );
    observador.observe(marco);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (reducido || !visible) return;
    const marco = marcoRef.current;
    if (!marco) return;

    let cuadro = 0;
    const alScroll = () => {
      if (cuadro) return;
      cuadro = requestAnimationFrame(() => {
        cuadro = 0;
        const visor = visorRef.current;
        if (!visor) return;
        const r = marco.getBoundingClientRect();
        // Progreso -1..1 del centro del marco a través del viewport.
        const p = 1 - (2 * (r.top + r.height / 2)) / window.innerHeight;
        const acimut = acimutBase + giro * Math.max(-1, Math.min(1, p));
        visor.setAttribute(
          "camera-orbit",
          `${acimut.toFixed(1)}deg ${elevacion} ${distancia}`,
        );
      });
    };

    window.addEventListener("scroll", alScroll, { passive: true });
    alScroll();
    return () => {
      window.removeEventListener("scroll", alScroll);
      if (cuadro) cancelAnimationFrame(cuadro);
    };
  }, [reducido, visible, acimutBase, giro, elevacion, distancia]);

  // Sin poster, quien pasa rápido ve un hueco mientras llegan visor y GLB.
  useEffect(() => {
    if (!visible) return;
    const visor = visorRef.current as
      | (HTMLElement & { loaded?: boolean })
      | null;
    if (!visor) return;
    const alCargar = () => setCargado(true);
    // En reentrada el GLB puede venir de cache y completar antes de que React
    // adjunte el listener; consultar `loaded` evita dejar el poster encima.
    if (visor.loaded) alCargar();
    else visor.addEventListener("load", alCargar, { once: true });
    return () => visor.removeEventListener("load", alCargar);
  }, [visible]);

  return (
    <div
      aria-hidden="true"
      className={`relative mt-8 h-72 md:h-80 ${className ?? ""}`}
      ref={marcoRef}
    >
      {!cargado && (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          decoding="async"
          loading="lazy"
          src={mediaUrl(poster)}
        />
      )}
      {visible && (
        <model-viewer
          alt={etiqueta}
          camera-orbit={`${acimutBase}deg ${elevacion} ${distancia}`}
          interaction-prompt="none"
          loading="eager"
          ref={visorRef}
          shadow-intensity="1"
          style={{ width: "100%", height: "100%", position: "relative" }}
          src={mediaUrl(src)}
        />
      )}
    </div>
  );
}
