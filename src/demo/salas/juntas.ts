// Sala: juntas
//
// Un archivo por sala para que el trabajo de arte de cada una sea
// independiente. Coordenadas locales a la sala: el eje -Z entra al fondo, los
// muros laterales estan en x = +/-4.5 y el techo a 3.6 m.

import { CylinderGeometry, Group, Mesh, PointLight } from "three";
import type { SceneKit, Surface } from "../scene-kit";

export function build(kit: SceneKit, accent: number): Group {
  const group = new Group();
  const accentSurface: Surface = { color: accent, roughness: 0.78 };
  const tableTopGeometry = new CylinderGeometry(1, 1, 0.1, 48);
  const chairStemGeometry = new CylinderGeometry(0.04, 0.04, 0.38, 16);
  const sealGeometry = new CylinderGeometry(0.055, 0.055, 0.024, 16);
  kit.track(tableTopGeometry);
  kit.track(chairStemGeometry);
  kit.track(sealGeometry);

  const tableX = -1.28;
  const tableZ = -2.58;

  const rug = kit.box(4.25, 0.012, 2.65, -1.32, 0.008, tableZ, kit.S.dark, false);
  rug.scale.y = 0.65;
  group.add(rug);

  const addOvalTable = () => {
    const top = new Mesh(tableTopGeometry, kit.material(kit.S.woodFine));
    top.position.set(tableX, 0.78, tableZ);
    top.scale.set(2.12, 1, 0.82);
    top.castShadow = kit.high;
    group.add(top);

    const apron = new Mesh(tableTopGeometry, kit.material(kit.S.wood));
    apron.position.set(tableX, 0.68, tableZ);
    apron.scale.set(1.86, 0.56, 0.62);
    apron.castShadow = kit.high;
    group.add(apron);

    group.add(kit.rbox(0.54, 0.56, 0.7, tableX - 0.86, 0.36, tableZ, kit.S.dark, true, 0.03));
    group.add(kit.rbox(0.54, 0.56, 0.7, tableX + 0.86, 0.36, tableZ, kit.S.dark, true, 0.03));
    group.add(kit.rbox(2.62, 0.08, 0.18, tableX, 0.12, tableZ - 0.46, kit.S.dark, true, 0.018));
    group.add(kit.rbox(2.12, 0.06, 0.14, tableX, 0.12, tableZ + 0.48, kit.S.dark, true, 0.018));
    group.add(kit.box(1.18, 0.032, 0.05, tableX - 0.28, 0.86, tableZ + 0.72, accentSurface));
    group.add(kit.contact(4.7, 2.3, tableX, tableZ));
  };

  const buildChair = (x: number, z: number, rotation: number, accentPad = false, folder = false) => {
    const chair = new Group();
    chair.add(kit.rbox(0.62, 0.11, 0.56, 0, 0.47, 0, kit.S.dark, true, 0.028));
    const back = kit.rbox(0.62, 0.74, 0.09, 0, 0.86, 0.29, kit.S.dark, true, 0.03);
    back.rotation.x = -0.1;
    chair.add(back);
    chair.add(kit.rbox(0.5, 0.05, 0.045, 0, 1.17, 0.31, accentPad ? accentSurface : kit.S.woodFine, true, 0.012));
    chair.add(kit.rbox(0.08, 0.08, 0.54, -0.38, 0.66, -0.03, kit.S.dark, true, 0.02));
    chair.add(kit.rbox(0.08, 0.08, 0.54, 0.38, 0.66, -0.03, kit.S.dark, true, 0.02));
    chair.add(kit.rbox(0.05, 0.28, 0.05, -0.38, 0.52, 0.14, kit.S.dark, true, 0.016));
    chair.add(kit.rbox(0.05, 0.28, 0.05, 0.38, 0.52, 0.14, kit.S.dark, true, 0.016));

    const stem = new Mesh(chairStemGeometry, kit.material(kit.S.dark));
    stem.position.set(0, 0.23, 0);
    stem.castShadow = kit.high;
    chair.add(stem);
    for (let arm = 0; arm < 4; arm += 1) {
      const angle = (arm / 4) * Math.PI * 2;
      const spoke = kit.rbox(0.34, 0.045, 0.055, 0, 0.06, 0, kit.S.dark, true, 0.014);
      spoke.position.x = Math.cos(angle) * 0.19;
      spoke.position.z = Math.sin(angle) * 0.19;
      spoke.rotation.y = angle;
      chair.add(spoke);
    }

    if (folder) {
      const folderMesh = kit.rbox(0.42, 0.045, 0.32, -0.08, 1.08, 0.27, accentSurface, true, 0.012);
      folderMesh.rotation.set(0.08, 0.12, -0.05);
      chair.add(folderMesh);
    }

    chair.position.set(x, 0, z);
    chair.rotation.y = rotation;
    group.add(chair);
    group.add(kit.contact(1.2, 1.2, x, z));
  };

  const addDossier = (x: number, z: number, rotation: number, scale: number, withAccent = true) => {
    const dossier = new Group();
    dossier.add(kit.rbox(0.52 * scale, 0.035, 0.34 * scale, 0, 0.81, 0, kit.S.paper, true, 0.01));
    dossier.add(
      kit.rbox(
        0.48 * scale,
        0.038,
        0.31 * scale,
        0.018,
        0.848,
        -0.014,
        withAccent ? accentSurface : kit.S.paper,
        true,
        0.01,
      ),
    );
    dossier.add(kit.box(0.56 * scale, 0.012, 0.035, 0, 0.872, 0.04, kit.S.dark));
    dossier.add(kit.box(0.035, 0.012, 0.36 * scale, -0.11 * scale, 0.876, 0, kit.S.dark));
    dossier.position.set(x, 0, z);
    dossier.rotation.y = rotation;
    group.add(dossier);
  };

  // La sala se carga a la izquierda para que el muro derecho respire; la mesa
  // oval es el ancla y sus apoyos cuentan peso institucional, no tablero flotante.
  addOvalTable();
  buildChair(tableX - 1.28, tableZ + 1.14, -0.06, true);
  buildChair(tableX + 1.18, tableZ + 1.18, 0.13, true);
  buildChair(tableX - 1.58, tableZ - 1.1, Math.PI + 0.08);
  buildChair(tableX + 0.72, tableZ - 1.08, Math.PI - 0.08, false, true);

  // La pantalla se vuelve mesa de decisión: un tablero oscuro, agenda jerárquica
  // y repisa de dispositivo sustituyen tarjetas clonadas de presentación.
  group.add(kit.rbox(2.48, 1.38, 0.08, 1.28, 1.86, -4.32, kit.S.dark, true, 0.012));
  const screen = kit.emissive(2.28, 1.18, kit.S.dark.color);
  screen.position.set(1.28, 1.86, -4.26);
  group.add(screen);
  for (const [x, y, w, h, surface] of [
    [0.55, 2.18, 0.46, 0.13, accentSurface],
    [1.28, 2.2, 0.66, 0.15, accentSurface],
    [2.02, 2.16, 0.36, 0.12, accentSurface],
    [0.82, 1.78, 0.76, 0.32, kit.S.paper],
    [1.78, 1.76, 0.54, 0.26, kit.S.paper],
  ] as const) {
    const card = kit.emissive(w, h, surface.color);
    card.position.set(x, y, -4.215);
    group.add(card);
  }
  group.add(kit.rbox(1.22, 0.08, 0.14, 1.3, 1.02, -4.31, kit.S.woodFine, true, 0.012));
  group.add(kit.rbox(0.42, 0.07, 0.11, 0.94, 1.1, -4.3, kit.S.dark, true, 0.012));
  group.add(kit.box(0.52, 0.028, 0.045, 1.58, 1.08, -4.24, accentSurface));

  // El aparador bajo reemplaza accesorios sueltos: guarda cables, muestras y el
  // control de videollamada sin invadir el vano izquierdo.
  group.add(kit.rbox(1.84, 0.5, 0.36, 1.24, 0.37, -4.05, kit.S.wood, true, 0.018));
  group.add(kit.rbox(1.62, 0.12, 0.32, 1.24, 0.12, -3.86, kit.S.dark, true, 0.012));
  for (const [x, w] of [
    [0.72, 0.46],
    [1.24, 0.38],
    [1.76, 0.46],
  ] as const) {
    group.add(kit.box(w, 0.035, 0.04, x, 0.42, -3.855, kit.S.dark));
    group.add(kit.box(w * 0.56, 0.024, 0.045, x, 0.58, -3.85, accentSurface));
  }
  group.add(kit.contact(2.2, 0.8, 1.24, -4.0));

  // En mesa quedan sólo expedientes de distinto peso visual y marcas de decisión;
  // la jerarquía evita la lectura de papelería decorativa.
  addDossier(tableX - 1.28, tableZ + 0.16, -0.2, 1.08);
  addDossier(tableX - 0.2, tableZ - 0.28, 0.18, 0.88, false);
  addDossier(tableX + 0.76, tableZ + 0.28, -0.32, 0.98);
  for (const [x, z, rotation, w] of [
    [tableX - 0.7, tableZ + 0.48, 0.14, 0.32],
    [tableX + 1.24, tableZ - 0.22, -0.18, 0.24],
  ] as const) {
    const sheet = kit.box(w, 0.006, 0.22, x, 0.807, z, kit.S.paper);
    sheet.rotation.y = rotation;
    group.add(sheet);
  }
  const stamp = new Mesh(sealGeometry, kit.material(kit.S.dark));
  stamp.position.set(tableX + 0.2, 0.84, tableZ + 0.47);
  stamp.castShadow = kit.high;
  group.add(stamp);
  group.add(kit.rbox(0.16, 0.05, 0.08, tableX + 0.48, 0.84, tableZ - 0.55, kit.S.dark, true, 0.012));

  // Dos cédulas desiguales bastan para ubicar autoridad mexicana sin competir
  // con la placa HTML del muro derecho ni con la salida del fondo izquierdo.
  for (const [x, y, w, h, variant] of [
    [-3.38, 2.16, 0.54, 0.7, "seal"],
    [-2.72, 2.0, 0.42, 0.54, "line"],
  ] as const) {
    group.add(kit.rbox(w, h, 0.045, x, y, -4.34, kit.S.dark, true, 0.008));
    const diploma = kit.emissive(w - 0.1, h - 0.12, kit.S.paper.color);
    diploma.position.set(x, y, -4.29);
    group.add(diploma);
    if (variant === "seal") {
      const seal = new Mesh(sealGeometry, kit.material(accentSurface));
      seal.position.set(x + w * 0.22, y - h * 0.24, -4.265);
      seal.rotation.x = Math.PI / 2;
      group.add(seal);
    } else {
      group.add(kit.box(w * 0.46, 0.02, 0.04, x, y + h * 0.12, -4.265, accentSurface, false));
      group.add(kit.box(w * 0.36, 0.014, 0.04, x - w * 0.06, y - h * 0.08, -4.265, kit.S.dark, false));
    }
  }

  const screenGlow = new PointLight(accent, 1.1, 3.2, 2.4);
  screenGlow.position.set(1.35, 1.72, -3.85);
  group.add(screenGlow);

  return group;
}
