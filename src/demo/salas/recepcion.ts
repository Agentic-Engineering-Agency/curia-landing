// Sala: recepcion
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh, PointLight } from "three";
import { PALETTE, ROOM } from "../rooms";
import type { SceneKit } from "../scene-kit";

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();
  // Mostrador en L, con frente de madera y cubierta oscura.
  group.add(kit.rbox(3.0, 1.06, 0.66, 2.2, 0.53, -2.7, kit.S.wood));
  group.add(kit.rbox(0.66, 1.06, 1.7, 3.37, 0.53, -1.75, kit.S.wood));
  group.add(kit.rbox(3.14, 0.07, 0.8, 2.2, 1.09, -2.68, kit.S.dark, true, 0.01));
  group.add(kit.rbox(0.8, 0.07, 1.84, 3.37, 1.09, -1.75, kit.S.dark, true, 0.01));
  group.add(kit.contact(4.6, 3.4, 2.5, -2.3));

  // Banca de espera con cojín.
  group.add(kit.rbox(2.5, 0.1, 0.66, -2.5, 0.44, -3.0, kit.S.woodFine, true, 0.012));
  group.add(kit.rbox(2.42, 0.1, 0.6, -2.5, 0.52, -3.0, kit.S.dark, true, 0.02));
  for (const offset of [-1.05, 1.05]) {
    group.add(kit.box(0.09, 0.4, 0.58, -2.5 + offset, 0.2, -3.0, kit.S.metal));
  }
  group.add(kit.contact(3.3, 1.8, -2.5, -3.0));

  // Maceta: único volumen orgánico, fija la escala humana.
  const pot = new Mesh(new CylinderGeometry(0.27, 0.21, 0.48, 24), kit.material(kit.S.dark));
  pot.position.set(-3.35, 0.24, -0.6);
  pot.castShadow = kit.high;
  group.add(pot);
  for (const [dx, dz, h] of [
    [0, 0, 1.5],
    [0.12, 0.08, 1.15],
    [-0.1, -0.07, 1.32],
  ]) {
    const stem = new Mesh(
      new CylinderGeometry(0.028, 0.035, h, 8),
      kit.material({ color: accent, roughness: 0.72 }),
    );
    stem.position.set(-3.35 + dx, 0.42 + h / 2, -0.6 + dz);
    group.add(stem);
  }
  group.add(kit.contact(1.5, 1.5, -3.35, -0.6));

  // Tapete de entrada.
  group.add(kit.box(2.6, 0.012, 1.7, -0.4, 0.008, 1.9, { color: 0x3a4149, roughness: 0.95, grain: "fabric", repeat: 4 }, false));

  return group;
}
