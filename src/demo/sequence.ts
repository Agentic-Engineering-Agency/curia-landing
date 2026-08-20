// Modelo puro de la secuencia del despacho: progreso de scroll -> estado.
//
// No toca el DOM ni Three.js. Es la pieza que se porta tal cual a React:
// el driver lee scroll, llama a `resolveSequence` y aplica el resultado de
// forma imperativa. No asigna memoria por frame si se le pasa `target`.

/** Peso de scroll de una meseta: cuánto se detiene la cámara en un capítulo. */
export const HOLD_WEIGHT = 1;

/** Peso de scroll de un tránsito: cuánto tarda en viajar al siguiente. */
export const TRAVEL_WEIGHT = 1.4;

export type SequenceFrame = {
  /** Progreso de scroll crudo, 0..1. */
  progress: number;
  /** Posición remapeada sobre la curva de cámara, 0..1. */
  pathT: number;
  /** Capítulo activo. Durante un tránsito es el capítulo del que se sale. */
  chapterIndex: number;
  /** Avance dentro del segmento actual, 0..1. */
  segmentProgress: number;
  /** true en meseta (se lee el texto), false en tránsito (se viaja). */
  holding: boolean;
};

type Segment = {
  kind: "hold" | "travel";
  chapterIndex: number;
  /** Inicio y fin en espacio de scroll normalizado. */
  start: number;
  end: number;
  /** Posición sobre la curva al entrar y al salir del segmento. */
  fromT: number;
  toT: number;
};

export type Timeline = {
  segments: Segment[];
  chapterCount: number;
  /** Alto total recomendado del contenedor, en múltiplos de viewport. */
  viewportSpan: number;
};

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** Smoothstep: arranca y termina sin tirón, que es lo que hace legible un tránsito. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Construye la línea de tiempo alternando meseta y tránsito. Las paradas se
 * reparten uniformemente sobre la curva; el reparto desigual vive en el
 * espacio de scroll, no en la geometría.
 */
export function buildTimeline(chapterCount: number): Timeline {
  if (chapterCount < 2) {
    throw new Error("La secuencia necesita al menos dos capítulos.");
  }

  const travels = chapterCount - 1;
  const totalWeight = chapterCount * HOLD_WEIGHT + travels * TRAVEL_WEIGHT;

  const segments: Segment[] = [];
  let cursor = 0;

  for (let index = 0; index < chapterCount; index += 1) {
    const stopT = index / travels;
    const holdSpan = HOLD_WEIGHT / totalWeight;

    segments.push({
      kind: "hold",
      chapterIndex: index,
      start: cursor,
      end: cursor + holdSpan,
      fromT: stopT,
      toT: stopT,
    });
    cursor += holdSpan;

    if (index < travels) {
      const travelSpan = TRAVEL_WEIGHT / totalWeight;
      segments.push({
        kind: "travel",
        chapterIndex: index,
        start: cursor,
        end: cursor + travelSpan,
        fromT: stopT,
        toT: (index + 1) / travels,
      });
      cursor += travelSpan;
    }
  }

  // El último borde queda exactamente en 1 pese al error de punto flotante.
  segments[segments.length - 1].end = 1;

  return { segments, chapterCount, viewportSpan: totalWeight };
}

/**
 * Resuelve el estado de la secuencia para un progreso dado.
 * `target` permite reutilizar el objeto y no asignar en cada frame.
 */
export function resolveSequence(
  timeline: Timeline,
  rawProgress: number,
  target?: SequenceFrame,
): SequenceFrame {
  const progress = clamp01(rawProgress);
  const frame = target ?? ({} as SequenceFrame);
  const { segments } = timeline;

  let segment = segments[segments.length - 1];
  for (let index = 0; index < segments.length; index += 1) {
    if (progress < segments[index].end) {
      segment = segments[index];
      break;
    }
  }

  const span = segment.end - segment.start;
  const local = span > 0 ? clamp01((progress - segment.start) / span) : 1;

  frame.progress = progress;
  frame.chapterIndex = segment.chapterIndex;
  frame.segmentProgress = local;
  frame.holding = segment.kind === "hold";
  frame.pathT =
    segment.kind === "hold"
      ? segment.fromT
      : segment.fromT + (segment.toT - segment.fromT) * smoothstep(local);

  return frame;
}

/**
 * Progreso de scroll que deja la cámara en el centro de la meseta de un
 * capítulo. Lo usa la navegación por capítulos.
 */
export function progressForChapter(timeline: Timeline, chapterIndex: number): number {
  const hold = timeline.segments.find(
    (segment) => segment.kind === "hold" && segment.chapterIndex === chapterIndex,
  );
  if (!hold) return 0;
  return hold.start + (hold.end - hold.start) / 2;
}
