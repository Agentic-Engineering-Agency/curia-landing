// Sala: biblioteca
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, PointLight, SphereGeometry } from "three";
import { PALETTE, ROOM } from "../rooms";
import type { SceneKit } from "../scene-kit";
import { bookSpineTexture } from "../textures";

type BookRow =
  | { kind: "back"; x: number; y: number; z: number; span: number; seed: number }
  | { kind: "side"; x: number; y: number; z: number; span: number; seed: number };

const bookJitter = (seed: number) => {
  const raw = Math.sin(seed * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
};

/**
 * Ancho de lomo en mundo. Un codigo empastado real ronda 4cm, pero a la
 * distancia de camara eso cae a 9px y el tomo deja de leerse. Los tomos
 * juridicos gruesos justifican 6cm, que rinde unos 14px: legible sin mentir.
 */
const SPINE_WIDTH = 0.062;
/** Lomos que dibuja una pasada de la textura, medido sobre el generador. */
const SPINES_PER_TILE = 16;

/**
 * La tira de lomos se repite para que cada tomo mida lo que mide un tomo. Antes
 * cada malla recibía la tira completa comprimida en 15 cm: dieciséis lomos en
 * un pañuelo, que a cinco metros no resuelve y promedia a un color plano. Fue
 * exactamente la crítica de que los estantes leían como bloques macizos.
 */
function shelfMaterial(
  cache: Map<number, MeshStandardMaterial>,
  kit: SceneKit,
  base: MeshStandardMaterial,
  span: number,
) {
  const tiles = Math.max(1, Math.round(span / (SPINES_PER_TILE * SPINE_WIDTH)));
  const cached = cache.get(tiles);
  if (cached) return cached;
  // El clon comparte el canvas de origen, así que repetir no cuesta otra
  // textura en memoria de GPU, sólo otro juego de coordenadas.
  const map = base.map!.clone();
  map.needsUpdate = true;
  map.repeat.set(tiles, 1);
  const material = base.clone();
  material.map = map;
  kit.track(map);
  kit.track(material);
  cache.set(tiles, material);
  return material;
}

function addBookMesh(
  group: Group,
  kit: SceneKit,
  geometry: BoxGeometry,
  material: MeshStandardMaterial,
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
) {
  const book = new Mesh(geometry, material);
  book.scale.set(width, height, depth);
  book.position.set(x, y, z);
  book.castShadow = kit.high;
  book.receiveShadow = true;
  group.add(book);
  return book;
}

function addBookRow(
  group: Group,
  kit: SceneKit,
  geometry: BoxGeometry,
  material: MeshStandardMaterial,
  cache: Map<number, MeshStandardMaterial>,
  row: BookRow,
) {
  const baseSeed = Math.round(row.seed * 100);
  const back = row.kind === "back";

  // La masa de tomos es una sola pieza con la tira de lomos repetida a escala
  // real. Cuatro mallas anchas no daban más libros, sólo cuatro sitios donde la
  // misma tira se comprimía distinto.
  const gapEnd = 0.06 + bookJitter(baseSeed * 5) * 0.12;
  const massSpan = row.span - gapEnd;
  const massHeight = 0.3 + bookJitter(baseSeed * 17) * 0.07;
  const massDepth = 0.13 + bookJitter(baseSeed * 23) * 0.03;
  const baseY = row.y + 0.03;
  const shift = (row.span - massSpan) / 2 - gapEnd / 2;

  const mass = new Mesh(geometry, shelfMaterial(cache, kit, material, massSpan));
  mass.scale.set(
    back ? massSpan : massDepth,
    massHeight,
    back ? massDepth : massSpan,
  );
  mass.position.set(
    back ? row.x + shift : row.x,
    baseY + massHeight / 2,
    back ? row.z : row.z + shift,
  );
  mass.castShadow = kit.high;
  mass.receiveShadow = true;
  group.add(mass);

  // Un par de piezas fuera de la fila: la irregularidad la dan estas, no la
  // masa. Un tomo recostado sobre el hueco y otro sobresaliendo del plano.
  const leaning = 0.19 + bookJitter(baseSeed * 11) * 0.08;
  const edge = back ? row.x + row.span / 2 - leaning / 2 : row.z + row.span / 2 - leaning / 2;
  const laid = new Mesh(geometry, shelfMaterial(cache, kit, material, leaning));
  laid.scale.set(back ? leaning : 0.16, 0.075, back ? 0.16 : leaning);
  laid.position.set(back ? edge : row.x, baseY + 0.038, back ? row.z : edge);
  laid.rotation.y = back ? 0 : Math.PI / 2;
  laid.castShadow = kit.high;
  group.add(laid);

  if (baseSeed % 3 !== 1) {
    const jut = 0.11 + bookJitter(baseSeed * 29) * 0.05;
    const tall = 0.31 + bookJitter(baseSeed * 31) * 0.05;
    const at = back ? row.x - row.span / 2 + jut : row.z - row.span / 2 + jut;
    const book = new Mesh(geometry, shelfMaterial(cache, kit, material, jut));
    book.scale.set(back ? jut : massDepth + 0.05, tall, back ? massDepth + 0.05 : jut);
    book.position.set(back ? at : row.x - 0.03, baseY + tall / 2, back ? row.z + 0.035 : at);
    book.rotation.z = (bookJitter(baseSeed * 37) - 0.5) * 0.07;
    book.castShadow = kit.high;
    group.add(book);
  }
}

function addLegalPanel(group: Group, kit: SceneKit, accent: number) {
  group.add(kit.rbox(1.18, 1.35, 0.07, 0, 1.95, -4.04, kit.S.dark, true, 0.012));
  group.add(kit.box(1.02, 1.17, 0.03, 0, 1.95, -3.99, kit.S.paper, false));
  group.add(kit.box(0.055, 1.05, 0.035, -0.43, 1.95, -3.965, { color: accent, roughness: 0.82 }, false));
  for (const offset of [-0.34, -0.12, 0.1, 0.32]) {
    group.add(kit.box(0.58, 0.024, 0.035, 0.14, 1.95 + offset, -3.96, kit.S.dark, false));
  }
}

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();

  const bookGeometry = new BoxGeometry(1, 1, 1);
  const shelfCache = new Map<number, MeshStandardMaterial>();
  const bookTexture = bookSpineTexture(accent);
  const bookMaterial = new MeshStandardMaterial({
    color: 0xffffff,
    map: bookTexture,
    roughness: 0.78,
    metalness: 0,
    envMapIntensity: 0.9,
  });
  kit.track(bookGeometry);
  kit.track(bookTexture);
  kit.track(bookMaterial);

  // La biblioteca debe cerrar el recorrido como fuente autoritativa: dos bahías
  // de tomos enmarcan la cita verificada, en vez de repetir módulos sin jerarquía.
  group.add(kit.rbox(5.75, ROOM.height - 0.22, 0.5, 0, (ROOM.height - 0.22) / 2, -4.34, kit.S.wood, true, 0.018));
  group.add(kit.box(5.32, 2.9, 0.035, 0, 1.72, -4.06, kit.S.dark, false));
  group.add(kit.rbox(5.95, 0.16, 0.62, 0, 3.5, -4.28, kit.S.woodFine, true, 0.012));
  for (const x of [-2.75, -0.72, 0.72, 2.75]) {
    group.add(kit.rbox(0.1, 3.05, 0.56, x, 1.62, -4.18, kit.S.woodFine, true, 0.01));
  }
  for (const bayX of [-1.72, 1.72]) {
    for (let shelf = 0; shelf < 5; shelf += 1) {
      const y = 0.42 + shelf * 0.53;
      group.add(kit.box(1.78, 0.045, 0.54, bayX, y, -4.12, kit.S.woodFine, false));
      addBookRow(group, kit, bookGeometry, bookMaterial, shelfCache, { kind: "back", x: bayX, y, z: -3.94, span: 1.45, seed: 20 + shelf * 7 + bayX });
    }
  }
  addLegalPanel(group, kit, accent);
  group.add(kit.contact(6.3, 0.9, 0, -4.05));

  // El muro izquierdo queda limpio para el contenido HTML; la masa de libros se
  // desplaza al lado derecho y al fondo para que el vacío también componga.
  group.add(kit.rbox(0.5, 3.08, 4.35, 4.12, 1.54, -1.8, kit.S.wood, true, 0.016));
  group.add(kit.box(0.035, 2.76, 3.88, 3.84, 1.54, -1.8, kit.S.dark, false));
  group.add(kit.rbox(0.58, 0.14, 4.55, 4.04, 3.18, -1.8, kit.S.woodFine, true, 0.01));
  for (const y of [0.62, 1.34, 2.06]) {
    group.add(kit.box(0.54, 0.045, 3.72, 3.86, y, -1.8, kit.S.woodFine, false));
    addBookRow(group, kit, bookGeometry, bookMaterial, shelfCache, { kind: "side", x: 3.75, y, z: -1.8, span: 3.35, seed: 70 + y * 10 });
  }
  group.add(kit.contact(1.1, 4.9, 4.0, -1.8));

  // La mesa hace legible el acto de contrastar: tomo abierto, cita impresa,
  // sello y luz de lectura, sin poblar la sala con inventario.
  group.add(kit.rbox(2.35, 0.09, 1.18, -0.05, 0.78, -2.42, kit.S.wood, true, 0.014));
  for (const [dx, dz] of [
    [-0.92, -0.45],
    [0.92, -0.45],
    [-0.92, 0.45],
    [0.92, 0.45],
  ]) {
    group.add(kit.box(0.08, 0.74, 0.08, -0.05 + dx, 0.39, -2.42 + dz, kit.S.dark));
  }
  const openCoverLeft = kit.box(0.62, 0.018, 0.46, -0.29, 0.845, -2.48, { color: accent, roughness: 0.72 });
  openCoverLeft.rotation.z = 0.12;
  group.add(openCoverLeft);
  const openCoverRight = kit.box(0.62, 0.018, 0.46, 0.29, 0.845, -2.48, kit.S.dark);
  openCoverRight.rotation.z = -0.12;
  group.add(openCoverRight);
  const leftPage = kit.emissive(0.58, 0.44, PALETTE.bone);
  leftPage.rotation.set(-Math.PI / 2.15, 0, 0.12);
  leftPage.position.set(-0.28, 0.875, -2.48);
  group.add(leftPage);
  const rightPage = kit.emissive(0.58, 0.44, PALETTE.bone);
  rightPage.rotation.set(-Math.PI / 2.15, 0, -0.12);
  rightPage.position.set(0.28, 0.875, -2.48);
  group.add(rightPage);
  group.add(kit.box(0.055, 0.018, 0.48, 0, 0.872, -2.48, kit.S.dark, false));
  for (const [x, z, w] of [
    [-0.28, -2.56, 0.31],
    [-0.31, -2.46, 0.24],
    [0.25, -2.55, 0.28],
    [0.31, -2.44, 0.22],
  ]) {
    group.add(kit.box(w, 0.006, 0.014, x, 0.888, z, kit.S.dark, false));
  }
  group.add(kit.box(0.84, 0.018, 0.34, 0.62, 0.83, -2.1, kit.S.paper, false));
  group.add(kit.box(0.64, 0.024, 0.035, 0.62, 0.86, -2.28, { color: accent, roughness: 0.82 }, false));
  const looseVolumeA = addBookMesh(group, kit, bookGeometry, bookMaterial, 0.46, 0.065, 0.3, -0.76, 0.845, -2.03);
  looseVolumeA.rotation.y = 0.16;
  const looseVolumeB = addBookMesh(group, kit, bookGeometry, bookMaterial, 0.38, 0.055, 0.28, -0.72, 0.905, -2.02);
  looseVolumeB.rotation.y = 0.16;
  const seal = new Mesh(new CylinderGeometry(0.085, 0.075, 0.16, 18), kit.material(kit.S.dark));
  seal.position.set(-0.72, 0.9, -2.1);
  seal.castShadow = kit.high;
  group.add(seal);

  const lampStem = new Mesh(new CylinderGeometry(0.025, 0.025, 0.56, 12), kit.material(kit.S.dark));
  lampStem.position.set(0.92, 1.08, -2.74);
  lampStem.castShadow = kit.high;
  group.add(lampStem);
  group.add(kit.rbox(0.42, 0.12, 0.42, 0.92, 1.38, -2.74, kit.S.dark, true, 0.06));
  const readingLight = new PointLight(0xfff0d6, 5.8, 4.8, 2);
  readingLight.position.set(0.82, 1.52, -2.72);
  group.add(readingLight);
  group.add(kit.contact(3.1, 2.1, -0.05, -2.42));

  const chair = new Group();
  chair.position.set(-1.32, 0, -1.68);
  chair.rotation.y = -0.22;
  chair.add(kit.rbox(0.54, 0.08, 0.48, 0, 0.47, 0, kit.S.dark, true, 0.018));
  chair.add(kit.rbox(0.56, 0.62, 0.08, 0, 0.85, 0.27, kit.S.dark, true, 0.016));
  for (const [dx, dz] of [
    [-0.21, -0.17],
    [0.21, -0.17],
    [-0.21, 0.17],
    [0.21, 0.17],
  ]) {
    chair.add(kit.box(0.055, 0.45, 0.055, dx, 0.23, dz, kit.S.dark));
  }
  group.add(chair);

  // La escalera inclinada rompe la retícula de lomos y sugiere uso humano sin
  // introducir figuras.
  const railGeometry = new CylinderGeometry(0.028, 0.028, 2.55, 10);
  for (const x of [2.95, 3.28]) {
    const rail = new Mesh(railGeometry, kit.material(kit.S.woodFine));
    rail.position.set(x, 1.52, -3.18);
    rail.rotation.z = -0.28;
    rail.castShadow = kit.high;
    group.add(rail);
  }
  for (let rung = 0; rung < 5; rung += 1) {
    const step = new Mesh(new CylinderGeometry(0.018, 0.018, 0.42, 8), kit.material(kit.S.woodFine));
    step.position.set(3.11, 0.58 + rung * 0.38, -3.18);
    step.rotation.z = Math.PI / 2 - 0.28;
    step.castShadow = kit.high;
    group.add(step);
  }

  const globe = new Mesh(new SphereGeometry(0.22, 18, 12), kit.material({ color: accent, roughness: 0.7 }));
  globe.position.set(-0.88, 1.03, -2.78);
  globe.castShadow = kit.high;
  group.add(globe);
  const globeBase = new Mesh(new CylinderGeometry(0.13, 0.16, 0.08, 18), kit.material(kit.S.dark));
  globeBase.position.set(-0.88, 0.83, -2.78);
  globeBase.castShadow = kit.high;
  group.add(globeBase);

  return group;
}
