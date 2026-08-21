// Sala: juntas
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh, PointLight } from "three";
import { PALETTE, ROOM } from "../rooms";
import type { SceneKit } from "../scene-kit";

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();

  group.add(
    kit.box(5.2, 0.012, 2.9, 0, 0.008, -2.6, { color: 0x4c565a, roughness: 0.95, grain: "fabric", repeat: 5 }, false),
  );

  // Mesa larga con doble pedestal.
  group.add(kit.rbox(4.7, 0.09, 1.5, 0, 0.76, -2.6, kit.S.wood, true, 0.012));
  for (const offset of [-1.5, 1.5]) {
    group.add(kit.rbox(0.5, 0.68, 1.1, offset, 0.34, -2.6, kit.S.dark));
  }
  group.add(kit.contact(6.0, 3.0, 0, -2.6));

  // Seis sillas.
  for (const side of [-1, 1]) {
    for (const offset of [-1.55, 0, 1.55]) {
      const z = -2.6 + side * 1.16;
      group.add(kit.rbox(0.52, 0.09, 0.5, offset, 0.47, z, kit.S.dark, true, 0.02));
      group.add(kit.rbox(0.52, 0.6, 0.08, offset, 0.8, z + side * 0.23, kit.S.dark, true, 0.02));
      const post = new Mesh(new CylinderGeometry(0.042, 0.042, 0.42, 14), kit.material(kit.S.metal));
      post.position.set(offset, 0.23, z);
      group.add(post);
      group.add(kit.contact(1.05, 1.05, offset, z));
    }
  }

  // Pantalla de sala, con soporte visible.
  group.add(kit.box(3.0, 1.68, 0.09, 0, 1.86, -4.32, kit.S.dark));
  const panel = kit.emissive(2.82, 1.5, accent);
  panel.position.set(0, 1.86, -4.26);
  group.add(panel);
  group.add(kit.box(0.5, 0.06, 0.1, 0, 1.0, -4.34, kit.S.metal));

  // Papel y vasos sobre la mesa.
  for (const offset of [-1.5, 0, 1.5]) {
    group.add(kit.box(0.3, 0.008, 0.22, offset, 0.81, -2.2, kit.S.paper));
    const glass = new Mesh(new CylinderGeometry(0.035, 0.03, 0.11, 12), kit.material(kit.S.metal));
    glass.position.set(offset + 0.3, 0.86, -2.9);
    group.add(glass);
  }

  return group;
}
