// Sala: oficina
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh, PointLight } from "three";
import { PALETTE } from "../rooms";
import type { SceneKit, Surface } from "../scene-kit";

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();

  const accentSurface: Surface = { color: accent, roughness: 0.9, grain: "none" };
  const wallPaper: Surface = { color: PALETTE.bone, roughness: 0.94, grain: "none" };
  const deskWood: Surface = { color: 0xb8945f, roughness: 0.62, grain: "wood", repeat: [4, 2] };
  const deskTrimWood: Surface = { color: 0xd0b37a, roughness: 0.62, grain: "wood", repeat: [2, 1] };
  const credenzaWood: Surface = { color: 0xb99662, roughness: 0.64, grain: "wood", repeat: [2, 1] };
  const smallWood: Surface = { color: 0xc8a86f, roughness: 0.66, grain: "wood", repeat: 1 };
  const bookCloth: Surface = { color: 0x8d7656, roughness: 0.9, grain: "fabric", repeat: 1 };

  // La alfombra compacta recorta la zona de decisión sin devorar el vacío que
  // necesita el plano cercano alrededor del monitor.
  group.add(kit.rbox(3.25, 0.018, 2.35, -1.9, 0.015, -2.35, kit.S.dark, false, 0.03));

  // El escritorio se construye como pieza ejecutiva: mucha masa horizontal,
  // pedestales retrasados y sombra inferior para que no vuelva a leer como dos
  // cajas sosteniendo una tabla.
  group.add(kit.rbox(3.25, 0.12, 1.34, -1.9, 0.76, -2.45, deskWood, true, 0.035));
  group.add(kit.rbox(3.05, 0.46, 0.08, -1.9, 0.54, -3.08, deskTrimWood, true, 0.018));
  group.add(kit.rbox(0.62, 0.5, 1.02, -3.12, 0.42, -2.45, kit.S.dark, true, 0.022));
  group.add(kit.rbox(0.54, 0.46, 0.92, -0.82, 0.4, -2.5, deskTrimWood, true, 0.018));
  for (let drawer = 0; drawer < 3; drawer += 1) {
    group.add(kit.box(0.36, 0.026, 0.032, -0.82, 0.25 + drawer * 0.13, -3.01, kit.S.metal));
  }
  group.add(kit.rbox(0.18, 0.56, 0.12, -3.35, 0.42, -1.92, deskTrimWood, true, 0.014));
  group.add(kit.rbox(0.18, 0.56, 0.12, -0.45, 0.42, -1.92, deskTrimWood, true, 0.014));
  group.add(kit.contact(4.05, 2.55, -1.9, -2.43));

  // La silla alta domina como presencia humana implícita: girada, pesada y con
  // respaldo de piel, sostiene la idea de alguien que acaba de tomar una
  // decisión sin introducir una figura prohibida.
  const chair = new Group();
  chair.add(kit.rbox(0.74, 0.14, 0.64, 0, 0.49, 0, kit.S.dark, true, 0.04));
  chair.add(kit.rbox(0.7, 0.98, 0.12, 0, 0.98, 0.3, kit.S.dark, true, 0.045));
  chair.add(kit.rbox(0.08, 0.76, 0.18, -0.37, 0.91, 0.26, kit.S.dark, true, 0.04));
  chair.add(kit.rbox(0.08, 0.76, 0.18, 0.37, 0.91, 0.26, kit.S.dark, true, 0.04));
  chair.add(kit.rbox(0.92, 0.08, 0.1, 0, 0.73, -0.08, kit.S.dark, true, 0.026));
  const stem = new Mesh(new CylinderGeometry(0.055, 0.055, 0.42, 16), kit.material(kit.S.metal));
  stem.position.set(0, 0.24, 0);
  chair.add(stem);
  for (let foot = 0; foot < 5; foot += 1) {
    const angle = (foot / 5) * Math.PI * 2;
    const base = kit.rbox(0.4, 0.045, 0.075, Math.cos(angle) * 0.2, 0.06, Math.sin(angle) * 0.2, kit.S.metal, true, 0.012);
    base.rotation.y = -angle;
    chair.add(base);
  }
  const jacket = kit.rbox(0.46, 0.52, 0.1, 0.13, 1.03, 0.35, kit.S.dark, true, 0.05);
  jacket.rotation.set(0.16, 0.04, -0.08);
  chair.add(jacket);
  chair.position.set(-1.72, 0, -1.2);
  chair.rotation.y = -0.42;
  group.add(chair);
  group.add(kit.contact(1.75, 1.7, -1.72, -1.2));

  // Monitor 16:10 a escala real. El volumen y el bisel son 3D; el contenido
  // es HTML real puesto en perspectiva por CSS3D, no una textura horneada,
  // así que el texto sigue siendo texto.
  group.add(kit.rbox(1.42, 0.92, 0.05, -1.9, 1.3, -2.92, kit.S.dark, true, 0.009));
  const screen = kit.emissive(1.34, 0.84, 0x0e1316);
  screen.position.set(-1.9, 1.3, -2.892);
  group.add(screen);
  group.add(kit.rbox(0.16, 0.34, 0.12, -1.9, 0.93, -2.91, kit.S.dark, true, 0.018));
  group.add(kit.rbox(0.56, 0.035, 0.24, -1.9, 0.755, -2.87, kit.S.metal, true, 0.018));

  // El material legal queda agrupado en pocas masas legibles para acercamiento:
  // expediente, cinta y hojas, no confeti de papeles repartidos por toda la
  // mesa.
  group.add(kit.rbox(0.64, 0.026, 0.2, -1.9, 0.835, -2.24, kit.S.dark, true, 0.012));
  const file = new Group();
  file.add(kit.rbox(0.58, 0.055, 0.36, -0.92, 0.82, -2.2, wallPaper, true, 0.012));
  file.add(kit.rbox(0.56, 0.035, 0.34, -0.93, 0.865, -2.18, kit.S.paper, true, 0.01));
  file.add(kit.box(0.62, 0.018, 0.035, -0.92, 0.895, -2.18, accentSurface));
  file.add(kit.box(0.035, 0.02, 0.38, -0.92, 0.9, -2.18, accentSurface));
  group.add(file);

  // La lámpara conserva el único foco permitido; el brazo inclinado dirige la
  // atención hacia la pantalla sin competir con ella.
  const arm = new Mesh(new CylinderGeometry(0.022, 0.022, 0.66, 12), kit.material(kit.S.dark));
  arm.position.set(-3.04, 1.08, -2.82);
  arm.rotation.z = 0.26;
  group.add(arm);
  const shade = new Mesh(new CylinderGeometry(0.18, 0.11, 0.16, 20, 1, true), kit.material(smallWood));
  shade.position.set(-2.89, 1.4, -2.82);
  group.add(shade);
  group.add(kit.rbox(0.26, 0.035, 0.18, -3.08, 0.8, -2.8, kit.S.dark, true, 0.014));
  const bulb = new PointLight(0xffd9a0, 3.2, 3.4, 2);
  bulb.position.set(-2.9, 1.24, -2.8);
  group.add(bulb);

  // La credenza baja aporta oficio mexicano sin invadir el muro derecho donde
  // se monta el contenido HTML de la landing.
  group.add(kit.rbox(1.58, 0.58, 0.38, -3.62, 0.35, -4.24, credenzaWood, true, 0.028));
  group.add(kit.rbox(1.44, 0.06, 0.42, -3.62, 0.68, -4.24, smallWood, true, 0.02));
  group.add(kit.box(0.024, 0.42, 0.035, -3.62, 0.38, -4.02, accentSurface));
  for (let i = 0; i < 10; i += 1) {
    const spineSurface = i % 4 === 0 ? accentSurface : i % 4 === 1 ? kit.S.dark : i % 4 === 2 ? bookCloth : wallPaper;
    const book = kit.rbox(0.08 + (i % 3) * 0.018, 0.34 + (i % 4) * 0.035, 0.08, -4.22 + i * 0.095, 0.88 + (i % 4) * 0.017, -4.23, spineSurface, true, 0.006);
    book.rotation.z = i % 5 === 0 ? -0.04 : 0.02;
    group.add(book);
  }
  group.add(kit.contact(1.78, 0.62, -3.62, -4.24));

  // Las cédulas y diplomas se colocan sobre el fondo, no en el muro derecho,
  // para que el lado seguro quede limpio pero la sala siga leyendo como
  // despacho jurídico mexicano.
  const credentials = new Group();
  const credentialPositions = [
    [-4.1, 1.86, -4.42, 0.42, 0.34],
    [-3.58, 1.92, -4.42, 0.34, 0.46],
    [-3.06, 1.82, -4.42, 0.38, 0.3],
  ] as const;
  for (const [x, y, z, w, h] of credentialPositions) {
    credentials.add(kit.rbox(w + 0.06, h + 0.06, 0.026, x, y, z, kit.S.dark, false, 0.006));
    credentials.add(kit.box(w, h, 0.016, x, y, z + 0.018, wallPaper, false));
    credentials.add(kit.box(w * 0.46, 0.014, 0.018, x, y + h * 0.18, z + 0.028, accentSurface, false));
    credentials.add(kit.box(w * 0.34, 0.012, 0.018, x, y - h * 0.14, z + 0.028, kit.S.dark, false));
  }
  group.add(credentials);

  // El juego de escritorio concentra escala cercana: sello, portalápices, taza
  // y lentes bastan para sugerir trabajo real sin llenar la escena de props.
  const deskSet = new Group();
  const cup = new Mesh(new CylinderGeometry(0.05, 0.042, 0.105, 18), kit.material(kit.S.paper));
  cup.position.set(-1.25, 0.86, -2.48);
  cup.castShadow = kit.high;
  deskSet.add(cup);
  const pencilCup = new Mesh(new CylinderGeometry(0.052, 0.052, 0.12, 16), kit.material(kit.S.dark));
  pencilCup.position.set(-2.58, 0.87, -2.67);
  pencilCup.castShadow = kit.high;
  deskSet.add(pencilCup);
  for (let pencil = 0; pencil < 3; pencil += 1) {
    const pen = new Mesh(new CylinderGeometry(0.006, 0.006, 0.18, 8), kit.material(pencil === 1 ? accentSurface : kit.S.metal));
    pen.position.set(-2.6 + pencil * 0.025, 0.98, -2.67);
    pen.rotation.z = -0.18 + pencil * 0.16;
    pen.castShadow = kit.high;
    deskSet.add(pen);
  }
  const seal = new Mesh(new CylinderGeometry(0.042, 0.056, 0.09, 18), kit.material(kit.S.dark));
  seal.position.set(-2.43, 0.875, -2.28);
  seal.castShadow = kit.high;
  deskSet.add(seal);
  deskSet.add(kit.box(0.13, 0.012, 0.045, -1.01, 0.925, -2.09, kit.S.dark));
  deskSet.add(kit.box(0.012, 0.012, 0.12, -0.95, 0.925, -2.04, kit.S.dark));
  for (let sheet = 0; sheet < 4; sheet += 1) {
    const page = kit.box(0.32, 0.004, 0.21, -2.58, 0.79 + sheet * 0.005, -2.18, kit.S.paper);
    page.rotation.y = 0.08 + sheet * 0.1;
    deskSet.add(page);
  }
  group.add(deskSet);

  return group;
}
