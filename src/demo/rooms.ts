// Datos del despacho: paleta, geometría del espacio y capítulos.
//
// Todo color sale de los tokens que ya usa la landing en producción
// (`src/style.css` y `AmbientBackground.tsx`). No se introduce ninguna
// familia cromática nueva: los tonos de material son oscurecimientos o
// aclaramientos de esos mismos valores.

export const PALETTE = {
  ink: 0x1a2028, // --curia-text
  bone: 0xf8f6f2, // --curia-bg-subtle
  subtle: 0xf3efe7, // --curia-bg-subtle-2
  border: 0xe4e2de, // --curia-border
  borderStrong: 0xcec9c3, // --curia-border-strong
  floor: 0xcfc9c1, // --curia-bg-muted, oscurecido para piso
  teal: 0x0d7377, // --curia-primary
  tealLight: 0x24a697, // orbe teal de AmbientBackground
  tealDeep: 0x083e40, // --curia-primary-deep
  amber: 0xc9a75b, // orbe ámbar de AmbientBackground
} as const;

/** Dimensiones del módulo de sala. Una sala por capítulo. */
export const ROOM = {
  width: 9,
  depth: 9,
  height: 3.6,
  wall: 0.25,
} as const;

/** Distancia entre centros de sala consecutivos. */
export const PITCH = ROOM.depth + ROOM.wall;

export const DOORWAY = {
  width: 2.4,
  height: 2.5,
} as const;

export type Chapter = {
  id: string;
  /** Etiqueta corta del capítulo, en el registro de la landing. */
  kicker: string;
  title: string;
  body: string;
  /** Color de acento de la sala. */
  accent: number;
  /** Desplazamiento lateral de la cámara dentro de la sala. */
  cameraX: number;
  /** Punto al que mira la cámara, relativo al centro de la sala. */
  focus: { x: number; y: number; z: number };
  /** Lado del muro con ventana: 1 = derecha, -1 = izquierda. */
  windowSide: 1 | -1;
};

/**
 * Los cinco capítulos siguen el `morningSequence` que ya vive en el copy de
 * producción (`docs/landing-copy.md`), en el mismo orden.
 */
export const CHAPTERS: Chapter[] = [
  {
    id: "monitoreo",
    kicker: "Monitoreo judicial",
    title: "Antes de iniciar la jornada",
    body: "Los movimientos detectados llegan junto con el expediente y la fuente que les corresponde.",
    accent: PALETTE.teal,
    cameraX: -1.1,
    focus: { x: 2.1, y: 1.15, z: -2.6 },
    windowSide: 1,
  },
  {
    id: "plazos",
    kicker: "Plazos y Outlook",
    title: "Del aviso al plazo",
    body: "El acuerdo conserva su contexto mientras el equipo revisa el plazo calculado contra el documento original.",
    accent: PALETTE.amber,
    cameraX: 1.2,
    focus: { x: -1.9, y: 1.0, z: -2.4 },
    windowSide: -1,
  },
  {
    id: "biblioteca",
    kicker: "Biblioteca y OCR",
    title: "Del documento a la consulta",
    body: "La Biblioteca procesa los archivos del expediente; sólo los que selecciona la persona abogada se usan como fuentes.",
    accent: PALETTE.tealDeep,
    cameraX: -1.3,
    focus: { x: 2.5, y: 1.3, z: -2.2 },
    windowSide: 1,
  },
  {
    id: "asistentes",
    kicker: "Asistentes con contexto",
    title: "Una superficie de ayuda para cada momento",
    body: "Cada modalidad resuelve el contexto de forma explícita y respeta el aislamiento entre despachos y casos.",
    accent: PALETTE.tealLight,
    cameraX: 0.9,
    focus: { x: -0.4, y: 1.05, z: -2.8 },
    windowSide: -1,
  },
  {
    id: "evaluador",
    kicker: "Reference Evaluator",
    title: "De la respuesta al escrito",
    body: "La confianza de una cita debe verse antes de usarla: Curia muestra su estado contrastado con el SJF.",
    accent: PALETTE.teal,
    cameraX: 0,
    focus: { x: 0, y: 1.4, z: -3.2 },
    windowSide: 1,
  },
];

/** Centro en Z de la sala de un capítulo. */
export function roomCenterZ(index: number): number {
  return -index * PITCH;
}

/**
 * Desplazamiento lateral del vano que conecta la sala `index` con la
 * siguiente. Alterna de lado para que la cámara serpentee en vez de
 * atravesar un túnel recto.
 */
export function doorwayOffsetX(index: number): number {
  return index % 2 === 0 ? 1.5 : -1.5;
}
