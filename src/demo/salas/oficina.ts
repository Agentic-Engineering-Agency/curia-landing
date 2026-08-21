// Sala: oficina
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh, PointLight } from "three";
import { PALETTE, ROOM } from "../rooms";
import type { SceneKit } from "../scene-kit";

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();

  // Alfombra bajo el conjunto. Deliberadamente más chica que la zona: el
  // piso de duela es el mejor material de la escena y taparlo lo desperdicia.
  group.add(
    kit.box(3.1, 0.012, 2.3, -1.9, 0.008, -2.2, { color: 0x4c565a, roughness: 0.95, grain: "fabric", repeat: 4 }, false),
  );

  // Escritorio: cubierta, faldón y dos pedestales.
  group.add(kit.rbox(2.95, 0.08, 1.4, -1.9, 0.75, -2.45, kit.S.wood, true, 0.012));
  group.add(kit.box(2.6, 0.28, 0.08, -1.9, 0.58, -3.06, kit.S.woodFine));
  group.add(kit.rbox(0.72, 0.68, 1.22, -3.02, 0.34, -2.45, kit.S.dark));
  group.add(kit.rbox(0.72, 0.68, 1.22, -0.82, 0.34, -2.45, kit.S.dark));
  for (let drawer = 0; drawer < 3; drawer += 1) {
    group.add(kit.box(0.3, 0.028, 0.03, -0.82, 0.2 + drawer * 0.22, -3.07, kit.S.metal));
  }
  group.add(kit.contact(4.2, 2.7, -1.9, -2.45));

  // Silla girada respecto al escritorio: nadie deja la silla perfectamente
  // encuadrada al levantarse, y ese pequeño desalineo es lo que separa un
  // espacio usado de un showroom.
  const chair = new Group();
  chair.add(kit.rbox(0.6, 0.1, 0.58, 0, 0.47, 0, kit.S.dark, true, 0.022));
  chair.add(kit.rbox(0.6, 0.7, 0.09, 0, 0.87, 0.27, kit.S.dark, true, 0.022));
  const stem = new Mesh(new CylinderGeometry(0.048, 0.048, 0.4, 16), kit.material(kit.S.metal));
  stem.position.set(0, 0.22, 0);
  chair.add(stem);
  for (let arm = 0; arm < 5; arm += 1) {
    const angle = (arm / 5) * Math.PI * 2;
    chair.add(
      kit.box(0.34, 0.05, 0.07, Math.cos(angle) * 0.19, 0.05, Math.sin(angle) * 0.19, kit.S.metal),
    );
  }
  chair.position.set(-1.72, 0, -1.24);
  chair.rotation.y = -0.34;
  group.add(chair);
  group.add(kit.contact(1.7, 1.7, -1.72, -1.24));

  // Monitor 16:10 a escala real. El volumen y el bisel son 3D; el contenido
  // es HTML real puesto en perspectiva por CSS3D, no una textura horneada,
  // así que el texto sigue siendo texto.
  group.add(kit.rbox(1.42, 0.92, 0.05, -1.9, 1.3, -2.92, kit.S.dark, true, 0.009));
  const screen = kit.emissive(1.34, 0.84, 0x0e1316);
  screen.position.set(-1.9, 1.3, -2.892);
  group.add(screen);
  group.add(kit.box(0.22, 0.3, 0.14, -1.9, 0.87, -2.9, kit.S.dark));
  group.add(kit.box(0.42, 0.03, 0.2, -1.9, 0.73, -2.9, kit.S.metal));

  // Teclado y expedientes.
  group.add(kit.box(0.5, 0.02, 0.17, -1.9, 0.8, -2.32, kit.S.dark));
  group.add(kit.box(0.44, 0.055, 0.32, -0.95, 0.81, -2.2, kit.S.paper));
  group.add(kit.box(0.44, 0.045, 0.32, -0.95, 0.86, -2.18, { color: accent, roughness: 0.8 }));
  group.add(kit.box(0.44, 0.045, 0.32, -0.95, 0.9, -2.22, kit.S.paper));

  // Lámpara de escritorio, con foco cálido real.
  const arm = new Mesh(new CylinderGeometry(0.02, 0.02, 0.6, 12), kit.material(kit.S.dark));
  arm.position.set(-3.02, 1.07, -2.8);
  arm.rotation.z = 0.24;
  group.add(arm);
  const shade = new Mesh(new CylinderGeometry(0.15, 0.09, 0.15, 20, 1, true), kit.material(kit.S.woodFine));
  shade.position.set(-2.9, 1.38, -2.8);
  group.add(shade);
  const bulb = new PointLight(0xffd9a0, 3.2, 3.4, 2);
  bulb.position.set(-2.9, 1.24, -2.8);
  group.add(bulb);

  // Presencia implícita: el despacho se lee como recién dejado, no como
  // showroom vacío. Sin figuras humanas — el brief las excluye y una figura
  // 3D genérica abarata la pieza. Estos objetos dan el mismo anclaje.
  const presence = new Group();

  // Saco sobre el respaldo. Va dentro del grupo de la silla para que la siga
  // cuando esta gira, en vez de quedar flotando donde estaba antes.
  const jacket = kit.rbox(0.52, 0.44, 0.1, 0, 0, 0, { color: 0x39424c, roughness: 0.92, grain: "fabric", repeat: 2 }, true, 0.045);
  jacket.position.set(0.05, 0.9, 0.3);
  jacket.rotation.set(0.14, 0.05, -0.06);
  chair.add(jacket);

  // Taza a medio terminar, fuera del eje del teclado.
  const cup = new Mesh(new CylinderGeometry(0.045, 0.038, 0.095, 18), kit.material(kit.S.paper));
  cup.position.set(-1.28, 0.845, -2.5);
  cup.castShadow = kit.high;
  presence.add(cup);
  const coffee = kit.emissive(0.078, 0.078, 0x3b2a1c);
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.set(-1.28, 0.888, -2.5);
  presence.add(coffee);

  // Lentes de lectura dejados abiertos sobre el expediente.
  presence.add(kit.box(0.13, 0.012, 0.045, -1.02, 0.935, -2.14, kit.S.dark));
  presence.add(kit.box(0.012, 0.012, 0.12, -0.96, 0.935, -2.09, kit.S.dark));

  // Hojas abanicadas: alguien estaba revisando y se levantó.
  for (let sheet = 0; sheet < 4; sheet += 1) {
    const page = kit.box(0.3, 0.004, 0.21, -2.62, 0.795 + sheet * 0.005, -2.2, kit.S.paper);
    page.rotation.y = 0.12 + sheet * 0.09;
    presence.add(page);
  }

  group.add(presence);

  return group;
}
