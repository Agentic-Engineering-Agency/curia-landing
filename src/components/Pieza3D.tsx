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
type SolicitudVisor = {
  id: symbol;
  activar: () => void;
  cancelada: boolean;
};

let visorActivo: symbol | null = null;
const colaVisores: SolicitudVisor[] = [];
let capacidadVisor: boolean | undefined;

function entregarSiguienteVisor() {
  if (visorActivo) return;
  let solicitud = colaVisores.shift();
  while (solicitud?.cancelada) solicitud = colaVisores.shift();
  if (!solicitud) return;
  visorActivo = solicitud.id;
  solicitud.activar();
}

/** Garantiza un solo renderer/modelo vivo; posters cubren el resto. */
function solicitarVisor(id: symbol, activar: () => void): () => void {
  const solicitud: SolicitudVisor = { id, activar, cancelada: false };
  colaVisores.push(solicitud);
  entregarSiguienteVisor();
  return () => {
    solicitud.cancelada = true;
    if (visorActivo === id) {
      visorActivo = null;
      entregarSiguienteVisor();
    }
  };
}

function puedeRenderizar3D(): boolean {
  if (capacidadVisor !== undefined) return capacidadVisor;
  const navegador = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const nucleos = navigator.hardwareConcurrency || 4;
  const memoria = navegador.deviceMemory ?? (nucleos >= 8 ? 8 : 4);
  if (navegador.connection?.saveData || nucleos < 6 || memoria < 4) {
    capacidadVisor = false;
    return false;
  }

  const lienzo = document.createElement("canvas");
  const gl = lienzo.getContext("webgl", {
    failIfMajorPerformanceCaveat: true,
    powerPreference: "low-power",
  });
  if (!gl) {
    capacidadVisor = false;
    return false;
  }
  const depuracion = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(
    depuracion
      ? gl.getParameter(depuracion.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER),
  );
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  capacidadVisor = !/(swiftshader|llvmpipe|software|microsoft basic)/i.test(
    renderer,
  );
  return capacidadVisor;
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
  const idRef = useRef(Symbol("pieza-3d"));
  const [visible, setVisible] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [turno, setTurno] = useState(false);

  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        const cerca = entrada.isIntersecting;
        if (!cerca) setCargado(false);
        setVisible(cerca);
      },
      // El poster necesita poco anticipo; reducir 800 -> 200 px evita que dos
      // GLB vecinos entren juntos en parseo/compilación.
      { rootMargin: "200px 0px" },
    );
    observador.observe(marco);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (reducido || !visible || !puedeRenderizar3D()) {
      setTurno(false);
      return;
    }

    let temporizador = 0;
    let solicitado = false;
    let liberar = () => {};
    const solicitarEnReposo = () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => {
        if (solicitado) return;
        solicitado = true;
        liberar = solicitarVisor(idRef.current, () => {
          pedirVisor();
          setTurno(true);
        });
      }, 300);
    };

    window.addEventListener("scroll", solicitarEnReposo, { passive: true });
    solicitarEnReposo();
    return () => {
      window.clearTimeout(temporizador);
      window.removeEventListener("scroll", solicitarEnReposo);
      liberar();
      setTurno(false);
    };
  }, [reducido, visible]);

  useEffect(() => {
    if (reducido || !visible || !turno) return;
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
  }, [reducido, visible, turno, acimutBase, giro, elevacion, distancia]);

  // Sin poster, quien pasa rápido ve un hueco mientras llegan visor y GLB.
  useEffect(() => {
    if (!turno) return;
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
  }, [turno]);

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
      {turno && (
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
