import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

// model-viewer llega por CDN al entrar la sección en viewport: three.js queda
// fuera del bundle principal (123 kB gzip) y la landing no paga el visor si
// nadie llega hasta aquí. El GLB usa Draco; meshopt no carga en model-viewer.
const VISOR_URL =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

// Órbita de reposo medida sobre el render evaluado: tres cuartos, ligeramente
// en picada. El scroll gira el acimut ±28° alrededor de esta base.
const ACIMUT_BASE = 135;
const ELEVACION = "72deg";
const DISTANCIA = "105%";
const GIRO = 28;

let visorPedido = false;

function pedirVisor() {
  if (visorPedido || customElements.get("model-viewer")) return;
  visorPedido = true;
  const script = document.createElement("script");
  script.type = "module";
  script.src = VISOR_URL;
  document.head.append(script);
}

/** Balanza de la marca en 3D; la rotación acompaña al scroll de la sección. */
export default function Balanza() {
  const reducido = useReducedMotion();
  const marcoRef = useRef<HTMLDivElement | null>(null);
  const visorRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          pedirVisor();
          setVisible(true);
          observador.disconnect();
        }
      },
      { rootMargin: "240px" },
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
        const acimut = ACIMUT_BASE + GIRO * Math.max(-1, Math.min(1, p));
        visor.setAttribute(
          "camera-orbit",
          `${acimut.toFixed(1)}deg ${ELEVACION} ${DISTANCIA}`,
        );
      });
    };

    window.addEventListener("scroll", alScroll, { passive: true });
    alScroll();
    return () => {
      window.removeEventListener("scroll", alScroll);
      if (cuadro) cancelAnimationFrame(cuadro);
    };
  }, [reducido, visible]);

  // El GLB pesa 969 KB y el visor llega por CDN: sin poster, quien pasa
  // rápido ve un hueco vacío. El render fijo se muestra al instante y se
  // retira cuando el modelo real ya pinta.
  useEffect(() => {
    if (!visible) return;
    const visor = visorRef.current;
    if (!visor) return;
    const alCargar = () => setCargado(true);
    visor.addEventListener("load", alCargar);
    return () => visor.removeEventListener("load", alCargar);
  }, [visible]);

  return (
    <div
      aria-hidden="true"
      className="relative mt-8 h-72 md:h-80"
      ref={marcoRef}
    >
      {!cargado && (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          src="/media/balanza-poster.webp"
        />
      )}
      {visible && (
        <model-viewer
          alt="Balanza de la justicia"
          camera-orbit={`${ACIMUT_BASE}deg ${ELEVACION} ${DISTANCIA}`}
          interaction-prompt="none"
          loading="eager"
          ref={visorRef}
          shadow-intensity="1"
          src="/media/balanza.glb"
          style={{ width: "100%", height: "100%", position: "relative" }}
        />
      )}
    </div>
  );
}
