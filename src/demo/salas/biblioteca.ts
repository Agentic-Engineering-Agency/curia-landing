// Sala: biblioteca
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh, PointLight } from "three";
import { PALETTE, ROOM } from "../rooms";
import type { SceneKit } from "../scene-kit";

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();

  // Libreros a ambos lados, con lomos alternando tono.
  for (const side of [-1, 1]) {
    const x = side * 3.15;
    for (let bay = 0; bay < 3; bay += 1) {
      const z = -1.0 - bay * 1.5;
      group.add(kit.rbox(1.4, 2.62, 0.44, x, 1.31, z, kit.S.wood, true, 0.014));
      group.add(kit.rbox(1.5, 0.07, 0.5, x, 2.66, z, kit.S.woodFine, true, 0.01));
      for (let shelf = 0; shelf < 5; shelf += 1) {
        const y = 0.36 + shelf * 0.5;
        group.add(kit.box(1.24, 0.03, 0.4, x, y, z, kit.S.woodFine, false));
        const tone = (bay + shelf) % 3 === 0 ? accent : (bay + shelf) % 3 === 1 ? 0x2b3239 : PALETTE.tealDeep;
        group.add(kit.box(1.06, 0.33, 0.3, x, y + 0.185, z, { color: tone, roughness: 0.88, grain: "fabric", repeat: 2 }));
      }
      group.add(kit.contact(2.2, 1.9, x, z));
    }
  }

  // Atril central: donde termina el recorrido.
  group.add(kit.box(0.8, 0.055, 0.58, 0, 1.09, -3.2, kit.S.dark));
  const column = new Mesh(new CylinderGeometry(0.085, 0.16, 1.06, 20), kit.material(kit.S.woodFine));
  column.position.set(0, 0.53, -3.2);
  column.castShadow = kit.high;
  group.add(column);
  const book = kit.emissive(0.68, 0.48, PALETTE.bone);
  book.rotation.x = -Math.PI / 2.3;
  book.position.set(0, 1.14, -3.17);
  group.add(book);
  // La biblioteca se cierra con estantes en ambos muros y ahoga la luz de la
  // ventana. Medido: con 16 de intensidad la sala salía a 234/255 de
  // luminancia media contra 181-211 del resto. Este valor la alinea.
  const readingLight = new PointLight(0xfff0d6, 6.5, 5.2, 2);
  readingLight.position.set(0, 2.0, -3.2);
  group.add(readingLight);
  group.add(kit.contact(1.7, 1.5, 0, -3.2));

  return group;
}
