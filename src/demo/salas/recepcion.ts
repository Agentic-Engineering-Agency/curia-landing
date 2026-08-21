// Sala: recepcion
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh } from "three";
import type { SceneKit, Surface } from "../scene-kit";

const WALL_Z = -4.42;

const CHAIR_WOOD: Surface = { color: 0xb18b58, roughness: 0.68, grain: "wood", repeat: 1 };
const POT_CLAY: Surface = { color: 0x987353, roughness: 0.96, grain: "plaster", repeat: 1 };

function wallCredential(
  kit: SceneKit,
  x: number,
  y: number,
  width: number,
  height: number,
  accentSurface: Surface,
  variant: "large" | "ledger" | "seal",
): Group {
  const credential = new Group();
  credential.add(kit.rbox(width + 0.08, height + 0.08, 0.04, x, y, WALL_Z, kit.S.dark, true, 0.008));
  credential.add(kit.box(width, height, 0.018, x, y, WALL_Z + 0.03, kit.S.paper));

  if (variant === "large") {
    credential.add(kit.box(width * 0.62, 0.026, 0.02, x - width * 0.06, y + height * 0.27, WALL_Z + 0.045, accentSurface));
    credential.add(kit.box(width * 0.5, 0.018, 0.02, x - width * 0.05, y + height * 0.12, WALL_Z + 0.045, kit.S.dark));
    credential.add(kit.box(width * 0.42, 0.014, 0.02, x - width * 0.1, y, WALL_Z + 0.045, kit.S.dark));
    credential.add(kit.box(width * 0.2, height * 0.18, 0.02, x + width * 0.27, y - height * 0.26, WALL_Z + 0.045, accentSurface));
  } else if (variant === "ledger") {
    for (const [dy, w, surface] of [
      [0.2, 0.68, accentSurface],
      [0.04, 0.82, kit.S.dark],
      [-0.12, 0.56, kit.S.dark],
      [-0.27, 0.74, kit.S.dark],
    ] as const) {
      credential.add(kit.box(width * w, 0.018, 0.02, x, y + height * dy, WALL_Z + 0.045, surface));
    }
    credential.add(kit.box(0.07, height * 0.68, 0.02, x - width * 0.44, y - height * 0.02, WALL_Z + 0.045, accentSurface));
  } else {
    credential.add(kit.box(width * 0.72, 0.022, 0.02, x, y + height * 0.2, WALL_Z + 0.045, kit.S.dark));
    credential.add(kit.box(width * 0.48, 0.018, 0.02, x, y + height * 0.02, WALL_Z + 0.045, kit.S.dark));
    credential.add(kit.rbox(width * 0.34, height * 0.28, 0.022, x, y - height * 0.25, WALL_Z + 0.045, accentSurface, true, 0.008));
  }

  return credential;
}

function loungeChair(kit: SceneKit, x: number, z: number, rotation: number, accentSurface: Surface, withFolder = false): Group {
  const chair = new Group();
  chair.add(kit.rbox(0.76, 0.16, 0.72, 0, 0.42, 0, kit.S.dark, true, 0.022));
  const back = kit.rbox(0.76, 0.78, 0.12, 0, 0.83, -0.34, kit.S.dark, true, 0.022);
  back.rotation.x = -0.13;
  chair.add(back);
  chair.add(kit.rbox(0.12, 0.48, 0.74, -0.44, 0.58, 0, CHAIR_WOOD, true, 0.016));
  chair.add(kit.rbox(0.12, 0.48, 0.74, 0.44, 0.58, 0, CHAIR_WOOD, true, 0.016));
  chair.add(kit.rbox(0.86, 0.08, 0.1, 0, 0.66, -0.42, CHAIR_WOOD, true, 0.014));
  chair.add(kit.box(0.58, 0.035, 0.04, 0, 0.51, 0.35, accentSurface));
  for (const dx of [-0.28, 0.28]) {
    for (const dz of [-0.24, 0.24]) {
      chair.add(kit.box(0.055, 0.3, 0.055, dx, 0.16, dz, CHAIR_WOOD));
    }
  }
  if (withFolder) {
    const folder = kit.rbox(0.38, 0.04, 0.3, 0.08, 0.535, 0.04, kit.S.paper, true, 0.01);
    folder.rotation.y = -0.16;
    chair.add(folder);
    chair.add(kit.box(0.34, 0.018, 0.035, 0.09, 0.565, 0.04, accentSurface));
  }
  chair.position.set(x, 0, z);
  chair.rotation.y = rotation;
  chair.add(kit.contact(1.35, 1.35, 0, 0));
  return chair;
}

function addPlant(kit: SceneKit, accentSurface: Surface): Group {
  const plant = new Group();
  const potGeometry = new CylinderGeometry(0.32, 0.24, 0.55, 24);
  kit.track(potGeometry);
  const pot = new Mesh(potGeometry, kit.material(POT_CLAY));
  pot.position.set(3.72, 0.28, 0.75);
  pot.castShadow = kit.high;
  pot.receiveShadow = true;
  plant.add(pot);
  plant.add(kit.rbox(0.5, 0.055, 0.5, 3.72, 0.58, 0.75, kit.S.dark, true, 0.02));

  for (const [dx, y, dz, rotation, height] of [
    [-0.18, 1.1, 0.02, -0.55, 0.72],
    [0.0, 1.32, -0.03, 0, 0.86],
    [0.2, 1.08, 0.04, 0.52, 0.68],
    [-0.08, 0.9, 0.18, -0.25, 0.56],
    [0.14, 0.94, -0.18, 0.34, 0.6],
  ] as const) {
    const leaf = kit.rbox(0.16, height, 0.045, 3.72 + dx, y, 0.75 + dz, accentSurface, true, 0.04);
    leaf.rotation.z = rotation;
    plant.add(leaf);
  }
  plant.add(kit.contact(1.25, 1.25, 3.72, 0.75));
  return plant;
}

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();
  const accentSurface: Surface = { color: accent, roughness: 0.9, grain: "none" };
  const counterWood: Surface = { color: 0xb99563, roughness: 0.64, grain: "wood", repeat: [3, 1] };
  const counterTrimWood: Surface = { color: 0xd0b37a, roughness: 0.62, grain: "wood", repeat: [2, 1] };
  const wallPlasterPanel: Surface = { color: 0xe7dfd2, roughness: 0.98, grain: "plaster", repeat: [3, 2] };

  // El mostrador es la pieza ancla: el zócalo retraído, los paños hundidos y la
  // repisa de atención cuentan oficio sin sumar ornamento que la cámara no lee.
  group.add(kit.rbox(2.32, 0.92, 0.68, 3.0, 0.56, -2.35, counterWood, true, 0.024));
  group.add(kit.rbox(2.58, 0.1, 0.88, 3.0, 1.08, -2.35, kit.S.dark, true, 0.014));
  group.add(kit.rbox(1.22, 0.08, 0.26, 2.62, 1.21, -1.98, counterTrimWood, true, 0.012));
  group.add(kit.rbox(2.0, 0.16, 0.12, 3.0, 0.12, -1.99, kit.S.dark, true, 0.01));
  group.add(kit.rbox(1.46, 0.5, 0.045, 2.86, 0.59, -1.985, kit.S.dark, true, 0.012));
  group.add(kit.rbox(0.46, 0.66, 0.05, 3.86, 0.66, -1.98, counterTrimWood, true, 0.012));
  group.add(kit.box(0.045, 0.5, 0.06, 2.18, 0.59, -1.96, counterTrimWood));
  group.add(kit.box(0.045, 0.5, 0.06, 3.54, 0.59, -1.96, counterTrimWood));
  group.add(kit.box(0.84, 0.035, 0.055, 2.86, 0.83, -1.945, accentSurface));
  group.add(kit.box(0.34, 0.028, 0.06, 3.86, 0.78, -1.94, accentSurface));
  group.add(kit.contact(3.15, 1.75, 3.0, -2.35));

  // En vez de seis marcos clonados, el muro muestra una credencial mayor, una
  // bitácora de turnos y una cédula corta: menos piezas, más intención legal.
  group.add(kit.rbox(2.48, 1.5, 0.035, -2.44, 2.15, WALL_Z - 0.015, wallPlasterPanel, false, 0.012));
  group.add(wallCredential(kit, -3.08, 2.18, 0.58, 0.88, accentSurface, "large"));
  group.add(wallCredential(kit, -2.32, 2.34, 0.72, 0.54, accentSurface, "ledger"));
  group.add(wallCredential(kit, -1.7, 1.82, 0.46, 0.58, accentSurface, "seal"));
  group.add(kit.box(1.58, 0.035, 0.04, -2.43, 1.34, WALL_Z + 0.04, kit.S.dark, false));

  // El letrero queda bajo y lateral para que la marca acompañe al despacho, no
  // convierta la recepción en aparador.
  group.add(kit.box(1.26, 0.2, 0.03, -0.58, 2.82, WALL_Z + 0.02, kit.S.dark, false));
  group.add(kit.box(0.86, 0.03, 0.035, -0.58, 2.73, WALL_Z + 0.045, accentSurface, false));
  for (const [x, w] of [
    [-0.93, 0.08],
    [-0.73, 0.11],
    [-0.51, 0.08],
    [-0.31, 0.1],
  ] as const) {
    group.add(kit.box(w, 0.12, 0.035, x, 2.83, WALL_Z + 0.045, kit.S.paper, false));
  }

  // Las butacas siguen bajas para no competir con la placa izquierda; una queda
  // en uso y la otra en espera, evitando la lectura de inventario repetido.
  group.add(loungeChair(kit, -2.9, 0.88, 0.08, accentSurface, true));
  group.add(loungeChair(kit, -1.78, 0.72, -0.08, accentSurface));

  // La bandeja de admisión conecta la visita con el expediente: cada volumen
  // tiene una función reconocible desde la distancia de cámara.
  group.add(kit.rbox(0.74, 0.08, 0.42, 2.48, 1.18, -2.42, kit.S.dark, true, 0.012));
  for (const [x, z, y, w] of [
    [2.4, -2.56, 1.24, 0.48],
    [2.72, -2.36, 1.27, 0.42],
    [2.24, -2.22, 1.21, 0.36],
  ] as const) {
    const sheet = kit.box(w, 0.026, 0.32, x, y, z, kit.S.paper);
    sheet.rotation.y = x > 2.5 ? 0.12 : -0.08;
    group.add(sheet);
    group.add(kit.box(w * 0.8, 0.018, 0.035, x, y + 0.024, z, accentSurface));
  }
  group.add(kit.rbox(0.18, 0.16, 0.18, 3.32, 1.2, -2.56, kit.S.dark, true, 0.018));
  group.add(kit.box(0.3, 0.035, 0.2, 3.34, 1.15, -2.22, kit.S.dark));

  // El barro usa el yeso fotográfico como base mate; el follaje queda en acento
  // liso porque una veta sobre hojas pequeñas se vuelve ruido.
  group.add(addPlant(kit, accentSurface));

  return group;
}
