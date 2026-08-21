// Sala: archivo
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh, PointLight } from "three";
import { PALETTE, ROOM } from "../rooms";
import type { SceneKit } from "../scene-kit";

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();

  // Archiveros contra el muro derecho, con tiradores.
  for (let index = 0; index < 4; index += 1) {
    const z = -0.8 - index * 1.02;
    group.add(kit.rbox(0.88, 1.3, 0.6, 3.05, 0.65, z, kit.S.dark, true, 0.012));
    group.add(kit.rbox(0.9, 0.04, 0.62, 3.05, 1.32, z, kit.S.woodFine, true, 0.008));
    for (let drawer = 0; drawer < 4; drawer += 1) {
      const y = 0.22 + drawer * 0.31;
      group.add(kit.box(0.8, 0.28, 0.02, 3.05, y, z - 0.31, { color: 0x232a31, roughness: 0.6 }));
      group.add(kit.box(0.3, 0.03, 0.035, 3.05, y, z - 0.33, kit.S.metal));
    }
  }
  group.add(kit.contact(2.3, 5.6, 3.05, -2.3));

  // Mesa de digitalización con documentos abiertos.
  group.add(kit.rbox(1.7, 0.07, 0.85, -2.3, 0.79, -2.9, kit.S.wood, true, 0.01));
  for (const [dx, dz] of [
    [-0.75, -0.34],
    [0.75, -0.34],
    [-0.75, 0.34],
    [0.75, 0.34],
  ]) {
    group.add(kit.box(0.06, 0.79, 0.06, -2.3 + dx, 0.4, -2.9 + dz, kit.S.metal));
  }
  group.add(kit.box(0.6, 0.012, 0.42, -2.5, 0.83, -2.86, kit.S.paper));
  group.add(kit.box(0.6, 0.012, 0.42, -1.95, 0.83, -2.95, kit.S.paper));
  group.add(kit.contact(2.6, 1.9, -2.3, -2.9));

  // Cajas de traslado apiladas: el expediente antes de digitalizarse.
  for (const [x, z, levels] of [
    [1.4, -3.7, 3],
    [0.6, -3.9, 2],
  ]) {
    for (let level = 0; level < levels; level += 1) {
      group.add(
        kit.box(0.6, 0.4, 0.44, x, 0.2 + level * 0.4, z, {
          color: level % 2 === 0 ? PALETTE.borderStrong : PALETTE.border,
          roughness: 0.9,
        }),
      );
      group.add(kit.box(0.5, 0.02, 0.03, x, 0.32 + level * 0.4, z - 0.23, { color: accent, roughness: 0.8 }));
    }
    group.add(kit.contact(1.6, 1.4, x, z));
  }

  return group;
}
