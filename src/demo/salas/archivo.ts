// Sala: archivo
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh, PointLight } from "three";
import { PALETTE } from "../rooms";
import type { SceneKit, Surface } from "../scene-kit";

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();
  const archiveTone: Surface = { color: PALETTE.borderStrong, roughness: 0.88 };
  const spineTone: Surface = {
    color: accent,
    roughness: 0.82,
    grain: "fabric",
    repeat: 2,
  };
  const wheelGeometry = new CylinderGeometry(0.07, 0.07, 0.045, 14);
  const railGeometry = new CylinderGeometry(0.032, 0.032, 1.92, 10);
  const sealGeometry = new CylinderGeometry(0.12, 0.12, 0.12, 18);
  kit.track(wheelGeometry);
  kit.track(railGeometry);
  kit.track(sealGeometry);

  // El archivo vive en el muro derecho para dejar el izquierdo como plano de
  // lectura. Su silueta ahora tiene zócalo, corona, montantes y rieles de manejo.
  group.add(kit.box(0.06, 2.28, 3.86, 4.2, 1.17, -2.28, kit.S.wood, false));
  group.add(kit.rbox(0.88, 0.18, 3.98, 3.86, 0.12, -2.28, kit.S.dark, true, 0.012));
  group.add(kit.rbox(0.88, 0.16, 4.0, 3.86, 2.45, -2.28, kit.S.woodFine, true, 0.012));
  for (const z of [-4.22, -0.34]) {
    group.add(kit.rbox(0.82, 2.34, 0.08, 3.84, 1.18, z, kit.S.wood, true, 0.012));
  }
  for (const y of [0.46, 0.98, 1.52, 2.05]) {
    group.add(kit.box(0.8, 0.045, 3.78, 3.84, y, -2.28, kit.S.woodFine, y > 0.46));
  }
  for (const z of [-3.46, -2.46, -1.32]) {
    group.add(kit.box(0.055, 2.14, 0.045, 3.79, 1.27, z, kit.S.woodFine, false));
  }
  group.add(kit.box(0.05, 1.76, 0.035, 3.39, 1.36, -2.08, spineTone));
  group.add(kit.rbox(0.11, 0.92, 0.08, 3.35, 1.3, -3.9, kit.S.dark, true, 0.012));

  const archiveBoxes = [
    [3.54, 0.7, -3.66, 0.46, 0.42, kit.S.paper, 0.16],
    [3.6, 0.7, -3.04, 0.34, 0.36, archiveTone, -0.08],
    [3.52, 0.7, -2.36, 0.52, 0.38, kit.S.dark, 0.1],
    [3.6, 0.7, -1.58, 0.42, 0.44, kit.S.paper, -0.12],
    [3.52, 1.23, -3.54, 0.56, 0.34, kit.S.dark, 0.06],
    [3.6, 1.23, -2.76, 0.4, 0.46, kit.S.paper, -0.14],
    [3.55, 1.23, -1.88, 0.58, 0.38, archiveTone, 0.12],
    [3.58, 1.78, -3.48, 0.5, 0.4, archiveTone, -0.1],
    [3.52, 1.78, -2.66, 0.36, 0.48, kit.S.paper, 0.08],
    [3.6, 1.78, -1.82, 0.54, 0.34, kit.S.dark, -0.06],
  ] as const;

  for (const [x, y, z, width, height, surface, offset] of archiveBoxes) {
    group.add(kit.rbox(0.34, height, width, x + offset * 0.12, y, z, surface, true, 0.008));
    group.add(kit.box(0.03, 0.16, width * 0.62, x - 0.19, y + height * 0.08, z, spineTone));
  }
  group.add(kit.contact(1.55, 4.65, 3.78, -2.28));

  // La mesa de digitalización es la pieza media: tablero delgado, faldón,
  // riostras y scanner abierto explican el flujo físico -> OCR.
  group.add(kit.rbox(2.0, 0.08, 1.0, -0.52, 0.78, -2.0, kit.S.wood, true, 0.012));
  group.add(kit.rbox(1.72, 0.11, 0.72, -0.52, 0.67, -2.0, kit.S.woodFine, true, 0.01));
  for (const [dx, dz] of [
    [-0.84, -0.42],
    [0.84, -0.42],
    [-0.84, 0.42],
    [0.84, 0.42],
  ] as const) {
    group.add(kit.box(0.06, 0.76, 0.06, -0.52 + dx, 0.39, -2.0 + dz, kit.S.dark));
  }
  group.add(kit.box(1.62, 0.035, 0.05, -0.52, 0.42, -1.54, kit.S.dark));
  group.add(kit.box(1.62, 0.035, 0.05, -0.52, 0.42, -2.46, kit.S.dark));
  group.add(kit.rbox(0.82, 0.09, 0.52, -0.18, 0.87, -2.04, kit.S.dark, true, 0.012));
  const scannerLid = kit.rbox(0.68, 0.035, 0.42, -0.16, 0.98, -2.08, kit.S.dark, true, 0.008);
  scannerLid.rotation.x = -0.2;
  group.add(scannerLid);
  const scanGlow = kit.emissive(0.6, 0.38, PALETTE.bone);
  scanGlow.rotation.x = -Math.PI / 2;
  scanGlow.position.set(-0.18, 0.955, -2.0);
  group.add(scanGlow);
  group.add(kit.box(0.6, 0.012, 0.38, -0.86, 0.84, -1.84, kit.S.paper));
  group.add(kit.box(0.12, 0.014, 0.34, -0.86, 0.86, -1.84, spineTone));
  const deskLight = new PointLight(PALETTE.bone, 5.2, 3.8, 2);
  deskLight.position.set(-0.4, 1.55, -2.0);
  group.add(deskLight);
  group.add(kit.contact(2.5, 1.8, -0.52, -2.0));

  // El archivero rodante cuenta tránsito: ruedas, jaladeras y bandeja superior
  // justifican su presencia mejor que otra pila plana de cajas.
  group.add(kit.rbox(1.04, 0.8, 0.62, 1.34, 0.48, -1.1, kit.S.dark, true, 0.018));
  group.add(kit.rbox(1.16, 0.08, 0.72, 1.34, 0.92, -1.1, kit.S.woodFine, true, 0.01));
  group.add(kit.rbox(0.94, 0.22, 0.5, 1.34, 0.72, -1.1, archiveTone, true, 0.01));
  for (const [y, w] of [
    [0.34, 0.78],
    [0.56, 0.9],
  ] as const) {
    group.add(kit.box(w, 0.035, 0.66, 1.34, y, -1.1, kit.S.dark));
    group.add(kit.box(w * 0.42, 0.026, 0.05, 1.34, y + 0.07, -0.76, spineTone));
  }
  for (const [dx, dz] of [
    [-0.42, -0.24],
    [0.42, -0.24],
    [-0.42, 0.24],
    [0.42, 0.24],
  ] as const) {
    const wheel = new Mesh(wheelGeometry, kit.material(kit.S.dark));
    wheel.position.set(1.34 + dx, 0.08, -1.1 + dz);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = kit.high;
    group.add(wheel);
  }
  group.add(kit.contact(1.7, 1.2, 1.34, -1.1));

  // Pocos legajos, pero con tamaños distintos: el bloque pequeño narra espera de
  // clasificación sin volver a llenar la sala de unidades equivalentes.
  for (const [x, z, width, height, depth] of [
    [1.62, -3.34, 0.76, 0.18, 0.46],
    [0.94, -3.55, 0.58, 0.26, 0.42],
    [1.28, -3.86, 0.86, 0.13, 0.44],
  ] as const) {
    group.add(kit.rbox(width, height, depth, x, height / 2, z, kit.S.paper, true, 0.01));
    group.add(kit.box(width * 0.86, 0.022, 0.04, x, height + 0.014, z, spineTone));
    group.add(kit.box(0.045, 0.024, depth * 0.86, x, height + 0.016, z, spineTone));
  }
  group.add(kit.contact(1.7, 1.2, 1.22, -3.6));

  // La escalera estrecha remata la verticalidad del archivo y guía la mirada al
  // estante derecho, lejos de la placa de contenido del muro izquierdo.
  for (const [x, z] of [
    [2.82, -0.62],
    [3.18, -0.72],
  ] as const) {
    const rail = new Mesh(railGeometry, kit.material(kit.S.woodFine));
    rail.position.set(x, 0.98, z);
    rail.rotation.z = 0.2;
    rail.castShadow = kit.high;
    group.add(rail);
  }
  for (let rung = 0; rung < 5; rung += 1) {
    group.add(kit.box(0.48, 0.04, 0.07, 3.0, 0.34 + rung * 0.32, -0.67, kit.S.woodFine));
  }
  group.add(kit.contact(0.9, 0.8, 3.0, -0.68));

  // Las cédulas de fondo se reducen a dos piezas desiguales: dan autoridad sin
  // llenar el paño ni interferir con el vano derecho.
  for (const [x, y, width, height, mark] of [
    [-2.2, 1.58, 0.58, 0.78, "band"],
    [-1.48, 1.5, 0.42, 0.58, "seal"],
  ] as const) {
    group.add(kit.box(width + 0.08, height + 0.08, 0.04, x, y, -4.43, kit.S.woodFine, false));
    group.add(kit.box(width, height, 0.045, x, y, -4.455, kit.S.paper, false));
    if (mark === "band") {
      group.add(kit.box(width * 0.62, 0.035, 0.05, x, y + height * 0.24, -4.485, spineTone, false));
    } else {
      const seal = new Mesh(sealGeometry, kit.material(spineTone));
      seal.position.set(x + width * 0.22, y - height * 0.22, -4.49);
      seal.rotation.x = Math.PI / 2;
      group.add(seal);
    }
  }

  const seal = new Mesh(sealGeometry, kit.material(kit.S.dark));
  seal.position.set(-1.24, 0.86, -2.17);
  seal.castShadow = kit.high;
  group.add(seal);

  return group;
}
