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

// Las marcas son el centro medido de cada sala como fracción del VIDEO, y las
// salas no ocupan tramos iguales: apertura de 121 fotogramas, tramo conservado
// de 25 y tres piernas de 121, con los cruces de puerta medidos en los
// fotogramas 121, ~211, ~369 y ~458 de 509. Con salas desiguales los puntos
// medios entre marcas no pueden clavar todas las fronteras (el sistema sale no
// monótono), así que la copia anticipa el cruce como máximo medio segundo. Si
// se regenera una pierna hay que volver a medir, no repartir a ojo.
export const CAPITULOS: Capitulo[] = [
  {
    id: "monitoreo",
    kicker: "Monitoreo judicial",
    titulo: "Movimientos del expediente",
    cuerpo: "Cada aviso conserva fuente y contexto.",
    marca: 0.118,
  },
  {
    id: "plazos",
    kicker: "Plazos y Outlook",
    titulo: "Una fecha revisable",
    cuerpo: "Curia calcula el plazo y conserva la fuente.",
    marca: 0.326,
  },
  {
    id: "biblioteca",
    kicker: "Biblioteca y OCR",
    titulo: "Fuentes elegidas",
    cuerpo: "Sólo documentos procesados alimentan la consulta.",
    marca: 0.57,
  },
  {
    id: "asistentes",
    kicker: "Asistentes con contexto",
    titulo: "Borradores con respaldo",
    cuerpo: "Cada apoyo cita el expediente que lo sostiene.",
    marca: 0.811,
  },
  {
    id: "evaluador",
    kicker: "Reference Evaluator",
    titulo: "De la respuesta al escrito",
    cuerpo: "La confianza de una cita se ve antes de usarla.",
    marca: 0.949,
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
 * Capítulo más cercano a una posición del video, expresada de 0 a 1. Se elige
 * por distancia a la marca y no por rangos, para que no queden huecos. Las
 * marcas son los centros de los cinco tramos iguales que ocupa cada sala.
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

/**
 * Sirve el video desde un blob en memoria en vez de la URL del host.
 *
 * No es una optimización, es lo que hace que el scrub funcione en producción:
 * muchos hosts estáticos no responden peticiones Range, y sin Range el
 * navegador deja `video.seekable` en [0,0]. Con ese rango cada `currentTime`
 * que pedimos se recorta a cero y el video se ve congelado en el primer
 * fotograma, aunque en desarrollo funcione. Un blob siempre es completamente
 * seekable, así que el scrub deja de depender de lo que sirva el host.
 *
 * Devuelve la función que libera el objeto; si algo falla se queda con la
 * fuente original, que al menos pinta.
 */
export async function servirPorBlob(
  video: HTMLVideoElement,
): Promise<() => void> {
  const objeto = await blobDeVideo(video);
  if (!objeto) return () => {};
  video.src = objeto;
  return () => URL.revokeObjectURL(objeto);
}

/**
 * Resuelve la fuente reproducible del video a un object URL, sin tocar el
 * elemento. Separado de `servirPorBlob` para que un consumidor con montajes
 * repetidos (StrictMode de React) pueda cachear la URL y decidir él cuándo
 * asignarla: asignar y revocar dentro de la misma función pierde la carrera
 * del doble montaje y deja el `src` apuntando a un blob muerto.
 */
export async function blobDeVideo(
  video: HTMLVideoElement,
): Promise<string | null> {
  const fuentes = [...video.querySelectorAll("source")];
  const elegida = fuentes.find((f) => {
    const tipo = f.getAttribute("type");
    return tipo ? video.canPlayType(tipo) !== "" : true;
  });
  const url = elegida?.getAttribute("src") ?? video.getAttribute("src");
  if (!url) return null;

  try {
    // Las URLs llevan versión y /media se sirve immutable: force-cache evita
    // una revalidación innecesaria en visitas repetidas. El blob sigue siendo
    // obligatorio porque Workers Static Assets no entrega Range (medido).
    const respuesta = await fetch(url, { cache: "force-cache" });
    if (!respuesta.ok) return null;
    return URL.createObjectURL(await respuesta.blob());
  } catch {
    return null;
  }
}

type Opciones = {
  video: HTMLVideoElement;
  pista: HTMLElement;
  /** Llamado sólo cuando cambia el capítulo activo, nunca por frame. */
  alCambiarCapitulo?: (indice: number) => void;
};

/** Controles del scrub: arrancar/detener el bucle y saltar a un capítulo. */
export interface Scrub {
  arrancar: () => void;
  detener: () => void;
  irACapitulo: (indice: number) => void;
}

export function crearScrub({
  video,
  pista,
  alCambiarCapitulo,
}: Opciones): Scrub {
  let duracion = 0;
  let deseado = 0;
  let ultimoEscrito = -1;
  let capituloActivo = -1;
  let corriendo = false;
  let visible = false;
  let cuadro = 0;
  let escuchando = false;

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

  function despertar() {
    if (!corriendo || cuadro) return;
    cuadro = requestAnimationFrame(bucle);
  }

  function bucle() {
    cuadro = 0;
    if (!corriendo) return;

    visible = enCuadro();
    // Fuera de cuadro el bucle se apaga por completo. Scroll/resize/
    // visibilitychange lo despiertan de inmediato; no queda un rAF a 60 Hz
    // leyendo layout durante las otras once secciones.
    if (!visible || !duracion) return;

    // Se muestrea el scroll en cada frame mientras la película está cerca:
    // así el scrub no depende de la frecuencia de eventos de cada navegador.
    deseado = progresoScroll();
    const objetivo = tiempoPara(deseado, duracion);

    // Escribir currentTime cuesta un seek. Sin este umbral el navegador encola
    // seeks que nunca alcanza y el scrub se siente pegajoso.
    if (Math.abs(objetivo - ultimoEscrito) > paso()) {
      video.currentTime = objetivo;
      ultimoEscrito = objetivo;
    }

    const indice = capituloDe(ritmo(deseado));
    if (indice !== capituloActivo) {
      capituloActivo = indice;
      alCambiarCapitulo?.(indice);
    }
    cuadro = requestAnimationFrame(bucle);
  }

  function arrancar() {
    if (corriendo) return;
    corriendo = true;
    const tomarDuracion = () => {
      duracion = video.duration || 0;
      despertar();
    };
    if (video.readyState >= 1) tomarDuracion();
    else
      video.addEventListener("loadedmetadata", tomarDuracion, { once: true });
    if (!escuchando) {
      window.addEventListener("scroll", despertar, { passive: true });
      window.addEventListener("resize", despertar, { passive: true });
      document.addEventListener("visibilitychange", despertar);
      escuchando = true;
    }
    despertar();
  }

  function detener() {
    corriendo = false;
    if (cuadro) cancelAnimationFrame(cuadro);
    cuadro = 0;
    if (escuchando) {
      window.removeEventListener("scroll", despertar);
      window.removeEventListener("resize", despertar);
      document.removeEventListener("visibilitychange", despertar);
      escuchando = false;
    }
  }

  return {
    arrancar,
    detener,
    irACapitulo: (i: number) => {
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
      despertar();
      window.scrollTo({
        top: pista.offsetTop + ((lo + hi) / 2) * alto,
        behavior: "smooth",
      });
    },
  };
}
