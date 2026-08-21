// Driver de scrub: el scroll mueve `currentTime` de un video.
//
// Alternativa al despacho WebGL. La diferencia de fondo: aquí no hay escena en
// tiempo real, sólo un video ya calculado, así que el costo por frame es el
// decode y no el render. Eso permite fotorrealismo a cambio de perder la
// interfaz real dentro de la escena.

/** Capítulos del recorrido, en el orden del copy de producción. */
export type Capitulo = {
  id: string;
  kicker: string;
  titulo: string;
  cuerpo: string;
  /** Fracción del video donde esta sala se lee mejor, de 0 a 1. */
  marca: number;
};

export const CAPITULOS: Capitulo[] = [
  {
    id: "monitoreo",
    kicker: "Monitoreo judicial",
    titulo: "Movimientos del expediente",
    cuerpo: "Cada aviso conserva fuente y contexto.",
    marca: 0.09,
  },
  {
    id: "plazos",
    kicker: "Plazos y Outlook",
    titulo: "Una fecha revisable",
    cuerpo: "Curia calcula el plazo y conserva la fuente.",
    marca: 0.29,
  },
  {
    id: "biblioteca",
    kicker: "Biblioteca y OCR",
    titulo: "Fuentes elegidas",
    cuerpo: "Sólo documentos procesados alimentan la consulta.",
    marca: 0.49,
  },
  {
    id: "asistentes",
    kicker: "Asistentes con contexto",
    titulo: "Borradores con respaldo",
    cuerpo: "Cada apoyo cita el expediente que lo sostiene.",
    marca: 0.69,
  },
  {
    id: "evaluador",
    kicker: "Reference Evaluator",
    titulo: "De la respuesta al escrito",
    cuerpo: "La confianza de una cita se ve antes de usarla.",
    marca: 0.91,
  },
];

/**
 * Curva de ritmo: reparte el scroll entre las salas. Las pausas reciben más
 * recorrido que los tránsitos, así que el visitante se detiene donde hay algo
 * que leer. Es la misma idea del modelo WebGL, pero aplicada al tiempo del
 * video en vez de a una cámara.
 */
export function ritmo(progreso: number): number {
  const p = progreso < 0 ? 0 : progreso > 1 ? 1 : progreso;
  // Suavizado quíntico: arranca y frena sin corte mecánico.
  return p * p * p * (p * (p * 6 - 15) + 10);
}

/**
 * Capítulo más cercano a una posición del recorrido. Se elige por distancia a
 * la marca y no por rangos, para que no queden huecos entre capítulos.
 */
export function capituloDe(p: number): number {
  let mejor = 0;
  let dist = Infinity;
  for (let i = 0; i < CAPITULOS.length; i += 1) {
    const d = Math.abs(CAPITULOS[i].marca - p);
    if (d < dist) {
      dist = d;
      mejor = i;
    }
  }
  return mejor;
}

/**
 * Tiempo de video para una posición del recorrido. Deja margen en la cola:
 * pedir exactamente `duracion` deja el video en un estado donde algunos
 * navegadores no vuelven a pintar.
 */
export function tiempoPara(progreso: number, duracion: number): number {
  if (duracion <= 0) return 0;
  return Math.min(ritmo(progreso) * duracion, duracion - 0.05);
}

type Opciones = {
  video: HTMLVideoElement;
  pista: HTMLElement;
  /** Llamado sólo cuando cambia el capítulo activo, nunca por frame. */
  alCambiarCapitulo?: (indice: number) => void;
};

export function crearScrub({ video, pista, alCambiarCapitulo }: Opciones) {
  let duracion = 0;
  let deseado = 0;
  let ultimoEscrito = -1;
  let capituloActivo = -1;
  let corriendo = false;
  let visible = false;
  let cuadro = 0;

  const paso = () => 1 / 30;

  function progresoScroll(): number {
    const alto = pista.offsetHeight - window.innerHeight;
    if (alto <= 0) return 0;
    const y = window.scrollY - pista.offsetTop;
    const p = y / alto;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }


  /**
   * Visibilidad por rectángulo en vez de IntersectionObserver. Medido: en un
   * navegador sin pantalla el observer no entrega callback y los eventos de
   * scroll tampoco llegan, así que un driver colgado de cualquiera de los dos
   * se queda mudo. El rectángulo se lee del layout, que sí es fiable.
   */
  function enCuadro(): boolean {
    if (document.hidden) return false;
    const r = pista.getBoundingClientRect();
    const margen = window.innerHeight;
    return r.bottom > -margen && r.top < window.innerHeight + margen;
  }

  function bucle() {
    cuadro = corriendo ? requestAnimationFrame(bucle) : 0;
    if (!corriendo) return;

    visible = enCuadro();
    if (!visible || !duracion) return;

    // Se muestrea el scroll en cada frame en vez de escuchar el evento: es una
    // lectura de layout barata y no depende de que el evento se emita.
    deseado = progresoScroll();

    // La cola necesita margen: pedir exactamente `duration` deja el video en un
    // estado donde algunos navegadores no vuelven a pintar.
    const objetivo = tiempoPara(deseado, duracion);

    // Escribir currentTime cuesta un seek. Sin este umbral el navegador encola
    // seeks que nunca alcanza y el scrub se siente pegajoso.
    if (Math.abs(objetivo - ultimoEscrito) > paso()) {
      video.currentTime = objetivo;
      ultimoEscrito = objetivo;
    }

    const indice = capituloDe(deseado);
    if (indice !== capituloActivo) {
      capituloActivo = indice;
      alCambiarCapitulo?.(indice);
    }
  }

  function arrancar() {
    if (corriendo) return;
    corriendo = true;
    const tomarDuracion = () => {
      duracion = video.duration || 0;
    };
    if (video.readyState >= 1) tomarDuracion();
    else video.addEventListener("loadedmetadata", tomarDuracion, { once: true });
    cuadro = requestAnimationFrame(bucle);
  }

  function detener() {
    corriendo = false;
    if (cuadro) cancelAnimationFrame(cuadro);
    cuadro = 0;
  }

  return { arrancar, detener, irACapitulo: (i: number) => {
    const alto = pista.offsetHeight - window.innerHeight;
    // Inversa aproximada del ritmo: se busca por bisección porque la quíntica
    // no tiene inversa cerrada y diez iteraciones sobran para un píxel.
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 20; k += 1) {
      const mid = (lo + hi) / 2;
      if (ritmo(mid) < CAPITULOS[i].marca) lo = mid;
      else hi = mid;
    }
    window.scrollTo({ top: pista.offsetTop + ((lo + hi) / 2) * alto, behavior: "smooth" });
  } };
}
