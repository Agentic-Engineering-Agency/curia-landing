import { Vector3 } from "three";
import { CHAPTERS, ROOM, doorwayOffsetX, roomCenterZ } from "./rooms";

export type CameraPath = {
  /** Escribe posición y objetivo para una posición normalizada del recorrido. */
  sample(pathT: number, outPosition: Vector3, outTarget: Vector3): void;
};

const OFFICE = 1;

function quadratic(out: Vector3, a: Vector3, b: Vector3, c: Vector3, t: number) {
  const inv = 1 - t;
  const aw = inv * inv;
  const bw = 2 * inv * t;
  const cw = t * t;
  out.set(
    a.x * aw + b.x * bw + c.x * cw,
    a.y * aw + b.y * bw + c.y * cw,
    a.z * aw + b.z * bw + c.z * cw,
  );
}

// Los vectores viven a nivel de módulo para que `sample` sólo escriba en los
// `out*` recibidos; el scroll llama esta función en cada frame.
const LAST_ROOM = CHAPTERS.length - 1;

const STOPS = CHAPTERS.map((chapter, index) => {
  const z = roomCenterZ(index);
  return new Vector3(chapter.cameraX, chapter.cameraY, z + chapter.cameraZ);
});

const TARGETS = CHAPTERS.map((chapter, index) => {
  const z = roomCenterZ(index);
  return new Vector3(chapter.focus.x, chapter.focus.y, z + chapter.focus.z);
});

const CONTROLS = CHAPTERS.slice(0, LAST_ROOM).map((_, index) => {
  return new Vector3(
    doorwayOffsetX(index),
    (STOPS[index].y + STOPS[index + 1].y) / 2,
    roomCenterZ(index) - ROOM.depth / 2 - ROOM.wall / 2,
  );
});

const EXIT_CONTROLS = CHAPTERS.slice(0, LAST_ROOM).map((_, index) => {
  return new Vector3(
    (STOPS[index].x + CONTROLS[index].x) / 2,
    (STOPS[index].y + CONTROLS[index].y) / 2,
    (STOPS[index].z + CONTROLS[index].z) / 2,
  );
});

const ENTRY_CONTROLS = CHAPTERS.slice(0, LAST_ROOM).map((_, index) => {
  return new Vector3(
    (CONTROLS[index].x + STOPS[index + 1].x) / 2,
    (CONTROLS[index].y + STOPS[index + 1].y) / 2,
    (CONTROLS[index].z + STOPS[index + 1].z) / 2,
  );
});

const TARGET_CONTROLS = CHAPTERS.slice(0, LAST_ROOM).map((_, index) => {
  return new Vector3(
    doorwayOffsetX(index) * 0.35 + CHAPTERS[index + 1].focus.x * 0.65,
    (TARGETS[index].y + TARGETS[index + 1].y) / 2,
    roomCenterZ(index) - ROOM.depth / 2 - ROOM.wall - 1.1,
  );
});

// La salida de la oficina rodea el escritorio por el pasillo izquierdo. Si la
// curva fuera directa al vano, el plano legible del monitor obligaría a cruzar
// por encima de la cubierta.
const officeSideStep = new Vector3(-3.95, 1.46, roomCenterZ(OFFICE) - 1.05);
const officeLeftAisle = new Vector3(-4.0, 1.5, roomCenterZ(OFFICE) - 3.24);
const officeBackOutControl = new Vector3(-2.35, 1.42, roomCenterZ(OFFICE) - 0.76);
const officeAisleControl = new Vector3(-4.08, 1.48, roomCenterZ(OFFICE) - 2.12);
const officeExitTarget = new Vector3(-3.25, 1.24, roomCenterZ(OFFICE) - 3.15);

export function createCameraPath(): CameraPath {
  return {
    sample(pathT, outPosition, outTarget) {
      const clamped = pathT < 0 ? 0 : pathT > 1 ? 1 : pathT;
      const scaled = clamped * LAST_ROOM;
      const leg = Math.min(Math.floor(scaled), LAST_ROOM - 1);
      const local = scaled - leg;

      if (leg === OFFICE) {
        if (local < 0.3) {
          quadratic(outPosition, STOPS[OFFICE], officeBackOutControl, officeSideStep, local / 0.3);
        } else if (local < 0.62) {
          quadratic(outPosition, officeSideStep, officeAisleControl, officeLeftAisle, (local - 0.3) / 0.32);
        } else if (local < 0.8) {
          quadratic(outPosition, officeLeftAisle, EXIT_CONTROLS[OFFICE], CONTROLS[OFFICE], (local - 0.62) / 0.18);
        } else {
          quadratic(outPosition, CONTROLS[OFFICE], ENTRY_CONTROLS[OFFICE], STOPS[OFFICE + 1], (local - 0.8) / 0.2);
        }

        if (local < 0.38) {
          outTarget.copy(TARGETS[OFFICE]);
        } else {
          quadratic(outTarget, TARGETS[OFFICE], officeExitTarget, TARGETS[OFFICE + 1], (local - 0.38) / 0.62);
        }
        return;
      }

      if (local < 0.5) {
        quadratic(outPosition, STOPS[leg], EXIT_CONTROLS[leg], CONTROLS[leg], local / 0.5);
      } else {
        quadratic(outPosition, CONTROLS[leg], ENTRY_CONTROLS[leg], STOPS[leg + 1], (local - 0.5) / 0.5);
      }
      quadratic(outTarget, TARGETS[leg], TARGET_CONTROLS[leg], TARGETS[leg + 1], local);
    },
  };
}
