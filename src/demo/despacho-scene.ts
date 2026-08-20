// Construcción de la escena del despacho y control de cámara.
//
// La escena es un enfilade de cinco salas conectadas por vanos que alternan
// de lado, así que la cámara serpentea en vez de atravesar un túnel recto.
// Nada aquí lee el scroll: recibe `pathT` y aplica. El scroll vive en el driver.
//
// Dos reglas de iluminación que sostienen la credibilidad del interior:
//   1. La arquitectura NO proyecta sombra, sólo la recibe. Si el techo
//      proyecta, bloquea el sol y todo el interior queda en luz ambiental
//      plana.
//   2. El sol entra por la ventana de la sala activa, rasante. La luz
//      direccional que baja desde arriba no existe dentro de un edificio.

import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PCFSoftShadowMap,
  PointLight,
  QuadraticBezierCurve3,
  SRGBColorSpace,
  Scene,
  ACESFilmicToneMapping,
  Vector3,
  WebGLRenderer,
  PMREMGenerator,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import {
  CHAPTERS,
  DOORWAY,
  PALETTE,
  PITCH,
  ROOM,
  doorwayOffsetX,
  roomCenterZ,
} from "./rooms";
import {
  fabricTexture,
  normalFromTexture,
  plankTexture,
  plasterTexture,
  roughnessNoise,
  woodTexture,
  type Repeat,
} from "./textures";

const EYE_HEIGHT = 1.56;

/** Geometrías compartidas: una caja unitaria escalada evita miles de buffers. */
const UNIT_BOX = new BoxGeometry(1, 1, 1);
const UNIT_PLANE = new PlaneGeometry(1, 1);

type Grain = "wood" | "plank" | "plaster" | "fabric" | "none";

type Surface = {
  color: number;
  roughness?: number;
  metalness?: number;
  grain?: Grain;
  repeat?: Repeat;
};

/** Pantalla del monitor: HTML real que el renderer CSS3D pone en perspectiva. */
export type ScreenMount = { element: HTMLElement; host: HTMLElement };

export function createDespacho(
  canvas: HTMLCanvasElement,
  quality: "high" | "low",
  screenMount?: ScreenMount,
): Despacho {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: quality === "high",
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = quality === "high";
  renderer.shadowMap.type = PCFSoftShadowMap;

  // Cache por firma: la misma superficie comparte material y textura.
  const roughnessMap = roughnessNoise(6);
  const textureCache = new Map<string, CanvasTexture>();
  const materialCache = new Map<string, MeshStandardMaterial>();
  const disposables: { dispose(): void }[] = [roughnessMap];

  function grainTexture(grain: Grain, color: number, repeat: Repeat) {
    if (grain === "none") return null;
    const key = `${grain}:${color}:${repeat}`;
    const cached = textureCache.get(key);
    if (cached) return cached;
    const texture =
      grain === "wood"
        ? woodTexture(color, repeat)
        : grain === "plank"
          ? plankTexture(color, repeat)
          : grain === "fabric"
            ? fabricTexture(color, repeat)
            : plasterTexture(color, repeat);
    textureCache.set(key, texture);
    disposables.push(texture);
    return texture;
  }

  // Cache aparte: el mapa de normales se deriva del de color, así que hay uno
  // por textura y se reutiliza igual que ella.
  const normalCache = new Map<CanvasTexture, CanvasTexture>();

  /** Relieve por tipo de material: la duela marca junta, el yeso casi nada. */
  const NORMAL_STRENGTH: Record<Grain, number> = {
    wood: 2.6,
    plank: 4.2,
    fabric: 2.2,
    plaster: 1.1,
    none: 0,
  };

  function normalFor(grain: Grain, map: CanvasTexture | null) {
    if (!map || grain === "none") return null;
    const cached = normalCache.get(map);
    if (cached) return cached;
    const normal = normalFromTexture(map, NORMAL_STRENGTH[grain]);
    normalCache.set(map, normal);
    disposables.push(normal);
    return normal;
  }

  function material(surface: Surface): MeshStandardMaterial {
    const {
      color,
      roughness = 0.85,
      metalness = 0,
      grain = "none",
      repeat = 1,
    } = surface;
    const key = `${color}|${roughness}|${metalness}|${grain}|${repeat}`;
    const cached = materialCache.get(key);
    if (cached) return cached;

    const map = grainTexture(grain, color, repeat);
    const normalMap = normalFor(grain, map);
    const result = new MeshStandardMaterial({
      color: map ? 0xffffff : color,
      map: map ?? null,
      normalMap,
      roughnessMap,
      // Sube la contribución del environment map: es lo que produce el brillo
      // especular que distingue madera barnizada y metal de pintura mate.
      envMapIntensity: 1.15,
      roughness,
      metalness,
    });
    materialCache.set(key, result);
    disposables.push(result);
    return result;
  }

  /** Caja posicionada por centro. `casts` es false para toda la arquitectura. */
  function box(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    surface: Surface,
    casts = true,
  ): Mesh {
    const mesh = new Mesh(UNIT_BOX, material(surface));
    mesh.scale.set(width, height, depth);
    mesh.position.set(x, y, z);
    mesh.castShadow = casts && quality === "high";
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Caja con filo redondeado, con geometría propia porque el radio no puede
   * escalarse sin deformarse. Una arista perfectamente viva es uno de los
   * delatores más fuertes de render sintético: un mueble real tiene canto.
   * Reservada a las piezas que la cámara ve de cerca.
   */
  function rbox(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    surface: Surface,
    casts = true,
    radius = 0.016,
  ): Mesh {
    const safe = Math.min(radius, Math.min(width, height, depth) / 2.05);
    const geometry = new RoundedBoxGeometry(width, height, depth, 2, safe);
    disposables.push(geometry);
    const mesh = new Mesh(geometry, material(surface));
    mesh.position.set(x, y, z);
    mesh.castShadow = casts && quality === "high";
    mesh.receiveShadow = true;
    return mesh;
  }

  function emissive(width: number, height: number, color: number): Mesh {
    const mesh = new Mesh(UNIT_PLANE, new MeshBasicMaterial({ color, toneMapped: false }));
    mesh.scale.set(width, height, 1);
    return mesh;
  }

  const shadowTexture = (() => {
    const size = 128;
    const element = document.createElement("canvas");
    element.width = size;
    element.height = size;
    const ctx = element.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(26, 32, 40, 0.42)");
    gradient.addColorStop(0.5, "rgba(26, 32, 40, 0.17)");
    gradient.addColorStop(1, "rgba(26, 32, 40, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new CanvasTexture(element);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  })();
  disposables.push(shadowTexture);

  function contact(width: number, depth: number, x: number, z: number): Mesh {
    const mesh = new Mesh(
      UNIT_PLANE,
      new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.scale.set(width, depth, 1);
    mesh.position.set(x, 0.014, z);
    return mesh;
  }


  const WALL: Surface = { color: PALETTE.subtle, roughness: 0.96, grain: "plaster", repeat: 4 };
  // Rugosidades bajadas a propósito: con 0.55 la madera no devolvía ningún
  // reflejo y se leía como pintura mate. Un barniz de oficina tiene brillo.
  const WOOD: Surface = { color: PALETTE.amber, roughness: 0.42, grain: "wood", repeat: 2 };
  const WOOD_FINE: Surface = { color: PALETTE.amber, roughness: 0.38, grain: "wood", repeat: 1 };
  const DARK: Surface = { color: 0x2b3239, roughness: 0.5, grain: "fabric", repeat: 3 };
  const METAL: Surface = { color: PALETTE.borderStrong, roughness: 0.24, metalness: 0.7 };
  const PAPER: Surface = { color: PALETTE.bone, roughness: 0.92 };


  /** Muro divisorio con vano: izquierda, derecha, dintel y jambas. */
  function partition(z: number, openingX: number): Group {
    const group = new Group();
    const half = ROOM.width / 2;
    const thickness = 0.34;
    const leftEdge = openingX - DOORWAY.width / 2;
    const rightEdge = openingX + DOORWAY.width / 2;

    const leftWidth = leftEdge + half;
    if (leftWidth > 0.01) {
      group.add(
        box(leftWidth, ROOM.height, thickness, (leftEdge - half) / 2, ROOM.height / 2, z, WALL, false),
      );
    }
    const rightWidth = half - rightEdge;
    if (rightWidth > 0.01) {
      group.add(
        box(rightWidth, ROOM.height, thickness, (rightEdge + half) / 2, ROOM.height / 2, z, WALL, false),
      );
    }
    const lintel = ROOM.height - DOORWAY.height;
    group.add(
      box(DOORWAY.width, lintel, thickness, openingX, DOORWAY.height + lintel / 2, z, WALL, false),
    );

    // Jambas: dan grosor al umbral, que es lo que hace legible el paso.
    for (const edge of [leftEdge, rightEdge]) {
      group.add(box(0.07, DOORWAY.height, thickness + 0.03, edge, DOORWAY.height / 2, z, WOOD_FINE, false));
    }
    group.add(
      box(DOORWAY.width, 0.06, thickness + 0.03, openingX, DOORWAY.height, z, WOOD_FINE, false),
    );
    // Umbral en el piso.
    group.add(box(DOORWAY.width, 0.02, thickness, openingX, 0.02, z, METAL, false));

    return group;
  }

  /** Ventana con mocheta: hueco luminoso, jambas y repisa. */
  function windowUnit(side: 1 | -1, z: number): Group {
    const group = new Group();
    const x = (side * ROOM.width) / 2;
    const width = 4.2;
    const height = 2.15;
    const centerY = 1.9;

    const glass = emissive(width, height, PALETTE.bone);
    glass.position.set(x - side * 0.16, centerY, z);
    glass.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
    group.add(glass);

    // Mocheta: cuatro piezas que dan profundidad al hueco.
    group.add(box(0.3, 0.1, width, x - side * 0.15, centerY + height / 2, z, WALL, false));
    group.add(box(0.3, 0.12, width, x - side * 0.15, centerY - height / 2, z, WOOD_FINE, false));
    for (const offset of [-width / 2, width / 2]) {
      group.add(box(0.3, height, 0.1, x - side * 0.15, centerY, z + offset, WALL, false));
    }
    // Parteluz. Es la única pieza de la ventana que proyecta sombra: el sol
    // atraviesa el muro (que no proyecta) y estas barras dibujan en el piso el
    // rectángulo de luz partido. Antes se intentó pintar ese charco con un
    // plano aditivo y se leía como calca; esto es la sombra real.
    for (const offset of [-1.05, 0, 1.05]) {
      group.add(box(0.06, height, 0.06, x - side * 0.2, centerY, z + offset, DARK, true));
    }
    // Peinazo horizontal, para que la sombra tenga también una barra cruzada.
    group.add(box(0.06, 0.06, width, x - side * 0.2, centerY, z, DARK, true));
    // Repisa interior.
    group.add(box(0.22, 0.06, width, x - side * 0.34, centerY - height / 2 - 0.03, z, WOOD_FINE, false));

    return group;
  }


  /** Luminaria empotrada: da interés al techo y justifica el relleno. */
  function ceilingFixture(z: number): Group {
    const group = new Group();
    for (const offset of [-2.1, 2.1]) {
      const panel = emissive(0.32, 2.6, 0xfff6e8);
      panel.rotation.x = Math.PI / 2;
      panel.position.set(offset, ROOM.height - 0.012, z);
      group.add(panel);
      group.add(box(0.44, 0.06, 2.72, offset, ROOM.height - 0.03, z, METAL, false));
    }
    return group;
  }

  /** Cuadro en muro: densidad barata y escala de referencia. */
  function framedPanel(side: 1 | -1, z: number, tone: number): Group {
    const group = new Group();
    const x = (side * (ROOM.width - 0.22)) / 2;
    group.add(box(0.05, 1.05, 0.78, x, 1.85, z, DARK, false));
    const art = emissive(0.66, 0.92, tone);
    art.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
    art.position.set(x - side * 0.04, 1.85, z);
    group.add(art);
    return group;
  }


  function reception(accent: number): Group {
    const group = new Group();
    // Mostrador en L, con frente de madera y cubierta oscura.
    group.add(rbox(3.0, 1.06, 0.66, 2.2, 0.53, -2.7, WOOD));
    group.add(rbox(0.66, 1.06, 1.7, 3.37, 0.53, -1.75, WOOD));
    group.add(rbox(3.14, 0.07, 0.8, 2.2, 1.09, -2.68, DARK, true, 0.01));
    group.add(rbox(0.8, 0.07, 1.84, 3.37, 1.09, -1.75, DARK, true, 0.01));
    group.add(contact(4.6, 3.4, 2.5, -2.3));

    // Banca de espera con cojín.
    group.add(rbox(2.5, 0.1, 0.66, -2.5, 0.44, -3.0, WOOD_FINE, true, 0.012));
    group.add(rbox(2.42, 0.1, 0.6, -2.5, 0.52, -3.0, DARK, true, 0.02));
    for (const offset of [-1.05, 1.05]) {
      group.add(box(0.09, 0.4, 0.58, -2.5 + offset, 0.2, -3.0, METAL));
    }
    group.add(contact(3.3, 1.8, -2.5, -3.0));

    // Maceta: único volumen orgánico, fija la escala humana.
    const pot = new Mesh(new CylinderGeometry(0.27, 0.21, 0.48, 24), material(DARK));
    pot.position.set(-3.35, 0.24, -0.6);
    pot.castShadow = quality === "high";
    group.add(pot);
    for (const [dx, dz, h] of [
      [0, 0, 1.5],
      [0.12, 0.08, 1.15],
      [-0.1, -0.07, 1.32],
    ]) {
      const stem = new Mesh(
        new CylinderGeometry(0.028, 0.035, h, 8),
        material({ color: accent, roughness: 0.72 }),
      );
      stem.position.set(-3.35 + dx, 0.42 + h / 2, -0.6 + dz);
      group.add(stem);
    }
    group.add(contact(1.5, 1.5, -3.35, -0.6));

    // Tapete de entrada.
    group.add(box(2.6, 0.012, 1.7, -0.4, 0.008, 1.9, { color: 0x3a4149, roughness: 0.95, grain: "fabric", repeat: 4 }, false));

    return group;
  }

  function privateOffice(accent: number): Group {
    const group = new Group();

    // Alfombra bajo el conjunto. Deliberadamente más chica que la zona: el
    // piso de duela es el mejor material de la escena y taparlo lo desperdicia.
    group.add(
      box(3.1, 0.012, 2.3, -1.9, 0.008, -2.2, { color: 0x4c565a, roughness: 0.95, grain: "fabric", repeat: 4 }, false),
    );

    // Escritorio: cubierta, faldón y dos pedestales.
    group.add(rbox(2.95, 0.08, 1.4, -1.9, 0.75, -2.45, WOOD, true, 0.012));
    group.add(box(2.6, 0.28, 0.08, -1.9, 0.58, -3.06, WOOD_FINE));
    group.add(rbox(0.72, 0.68, 1.22, -3.02, 0.34, -2.45, DARK));
    group.add(rbox(0.72, 0.68, 1.22, -0.82, 0.34, -2.45, DARK));
    for (let drawer = 0; drawer < 3; drawer += 1) {
      group.add(box(0.3, 0.028, 0.03, -0.82, 0.2 + drawer * 0.22, -3.07, METAL));
    }
    group.add(contact(4.2, 2.7, -1.9, -2.45));

    // Silla con base de cinco brazos.
    group.add(rbox(0.6, 0.1, 0.58, -1.9, 0.47, -1.3, DARK, true, 0.022));
    group.add(rbox(0.6, 0.7, 0.09, -1.9, 0.87, -1.03, DARK, true, 0.022));
    const stem = new Mesh(new CylinderGeometry(0.048, 0.048, 0.4, 16), material(METAL));
    stem.position.set(-1.9, 0.22, -1.3);
    group.add(stem);
    for (let arm = 0; arm < 5; arm += 1) {
      const angle = (arm / 5) * Math.PI * 2;
      group.add(
        box(0.34, 0.05, 0.07, -1.9 + Math.cos(angle) * 0.19, 0.05, -1.3 + Math.sin(angle) * 0.19, METAL),
      );
    }
    group.add(contact(1.7, 1.7, -1.9, -1.3));

    // Monitor 16:10 a escala real. El volumen y el bisel son 3D; el contenido
    // es HTML real puesto en perspectiva por CSS3D, no una textura horneada,
    // así que el texto sigue siendo texto.
    group.add(rbox(1.42, 0.92, 0.05, -1.9, 1.3, -2.92, DARK, true, 0.009));
    const screen = emissive(1.34, 0.84, 0x0e1316);
    screen.position.set(-1.9, 1.3, -2.892);
    group.add(screen);
    group.add(box(0.22, 0.3, 0.14, -1.9, 0.87, -2.9, DARK));
    group.add(box(0.42, 0.03, 0.2, -1.9, 0.73, -2.9, METAL));

    // Teclado y expedientes.
    group.add(box(0.5, 0.02, 0.17, -1.9, 0.8, -2.32, DARK));
    group.add(box(0.44, 0.055, 0.32, -0.95, 0.81, -2.2, PAPER));
    group.add(box(0.44, 0.045, 0.32, -0.95, 0.86, -2.18, { color: accent, roughness: 0.8 }));
    group.add(box(0.44, 0.045, 0.32, -0.95, 0.9, -2.22, PAPER));

    // Lámpara de escritorio, con foco cálido real.
    const arm = new Mesh(new CylinderGeometry(0.02, 0.02, 0.6, 12), material(DARK));
    arm.position.set(-3.02, 1.07, -2.8);
    arm.rotation.z = 0.24;
    group.add(arm);
    const shade = new Mesh(new CylinderGeometry(0.15, 0.09, 0.15, 20, 1, true), material(WOOD_FINE));
    shade.position.set(-2.9, 1.38, -2.8);
    group.add(shade);
    const bulb = new PointLight(0xffd9a0, 3.2, 3.4, 2);
    bulb.position.set(-2.9, 1.24, -2.8);
    group.add(bulb);

    return group;
  }

  function archive(accent: number): Group {
    const group = new Group();

    // Archiveros contra el muro derecho, con tiradores.
    for (let index = 0; index < 4; index += 1) {
      const z = -0.8 - index * 1.02;
      group.add(rbox(0.88, 1.3, 0.6, 3.05, 0.65, z, DARK, true, 0.012));
      group.add(rbox(0.9, 0.04, 0.62, 3.05, 1.32, z, WOOD_FINE, true, 0.008));
      for (let drawer = 0; drawer < 4; drawer += 1) {
        const y = 0.22 + drawer * 0.31;
        group.add(box(0.8, 0.28, 0.02, 3.05, y, z - 0.31, { color: 0x232a31, roughness: 0.6 }));
        group.add(box(0.3, 0.03, 0.035, 3.05, y, z - 0.33, METAL));
      }
    }
    group.add(contact(2.3, 5.6, 3.05, -2.3));

    // Mesa de digitalización con documentos abiertos.
    group.add(rbox(1.7, 0.07, 0.85, -2.3, 0.79, -2.9, WOOD, true, 0.01));
    for (const [dx, dz] of [
      [-0.75, -0.34],
      [0.75, -0.34],
      [-0.75, 0.34],
      [0.75, 0.34],
    ]) {
      group.add(box(0.06, 0.79, 0.06, -2.3 + dx, 0.4, -2.9 + dz, METAL));
    }
    group.add(box(0.6, 0.012, 0.42, -2.5, 0.83, -2.86, PAPER));
    group.add(box(0.6, 0.012, 0.42, -1.95, 0.83, -2.95, PAPER));
    group.add(contact(2.6, 1.9, -2.3, -2.9));

    // Cajas de traslado apiladas: el expediente antes de digitalizarse.
    for (const [x, z, levels] of [
      [1.4, -3.7, 3],
      [0.6, -3.9, 2],
    ]) {
      for (let level = 0; level < levels; level += 1) {
        group.add(
          box(0.6, 0.4, 0.44, x, 0.2 + level * 0.4, z, {
            color: level % 2 === 0 ? PALETTE.borderStrong : PALETTE.border,
            roughness: 0.9,
          }),
        );
        group.add(box(0.5, 0.02, 0.03, x, 0.32 + level * 0.4, z - 0.23, { color: accent, roughness: 0.8 }));
      }
      group.add(contact(1.6, 1.4, x, z));
    }

    return group;
  }

  function meetingRoom(accent: number): Group {
    const group = new Group();

    group.add(
      box(5.2, 0.012, 2.9, 0, 0.008, -2.6, { color: 0x4c565a, roughness: 0.95, grain: "fabric", repeat: 5 }, false),
    );

    // Mesa larga con doble pedestal.
    group.add(rbox(4.7, 0.09, 1.5, 0, 0.76, -2.6, WOOD, true, 0.012));
    for (const offset of [-1.5, 1.5]) {
      group.add(rbox(0.5, 0.68, 1.1, offset, 0.34, -2.6, DARK));
    }
    group.add(contact(6.0, 3.0, 0, -2.6));

    // Seis sillas.
    for (const side of [-1, 1]) {
      for (const offset of [-1.55, 0, 1.55]) {
        const z = -2.6 + side * 1.16;
        group.add(rbox(0.52, 0.09, 0.5, offset, 0.47, z, DARK, true, 0.02));
        group.add(rbox(0.52, 0.6, 0.08, offset, 0.8, z + side * 0.23, DARK, true, 0.02));
        const post = new Mesh(new CylinderGeometry(0.042, 0.042, 0.42, 14), material(METAL));
        post.position.set(offset, 0.23, z);
        group.add(post);
        group.add(contact(1.05, 1.05, offset, z));
      }
    }

    // Pantalla de sala, con soporte visible.
    group.add(box(3.0, 1.68, 0.09, 0, 1.86, -4.32, DARK));
    const panel = emissive(2.82, 1.5, accent);
    panel.position.set(0, 1.86, -4.26);
    group.add(panel);
    group.add(box(0.5, 0.06, 0.1, 0, 1.0, -4.34, METAL));

    // Papel y vasos sobre la mesa.
    for (const offset of [-1.5, 0, 1.5]) {
      group.add(box(0.3, 0.008, 0.22, offset, 0.81, -2.2, PAPER));
      const glass = new Mesh(new CylinderGeometry(0.035, 0.03, 0.11, 12), material(METAL));
      glass.position.set(offset + 0.3, 0.86, -2.9);
      group.add(glass);
    }

    return group;
  }

  function lawLibrary(accent: number): Group {
    const group = new Group();

    // Libreros a ambos lados, con lomos alternando tono.
    for (const side of [-1, 1]) {
      const x = side * 3.15;
      for (let bay = 0; bay < 3; bay += 1) {
        const z = -1.0 - bay * 1.5;
        group.add(rbox(1.4, 2.62, 0.44, x, 1.31, z, WOOD, true, 0.014));
        group.add(rbox(1.5, 0.07, 0.5, x, 2.66, z, WOOD_FINE, true, 0.01));
        for (let shelf = 0; shelf < 5; shelf += 1) {
          const y = 0.36 + shelf * 0.5;
          group.add(box(1.24, 0.03, 0.4, x, y, z, WOOD_FINE, false));
          const tone = (bay + shelf) % 3 === 0 ? accent : (bay + shelf) % 3 === 1 ? 0x2b3239 : PALETTE.tealDeep;
          group.add(box(1.06, 0.33, 0.3, x, y + 0.185, z, { color: tone, roughness: 0.88, grain: "fabric", repeat: 2 }));
        }
        group.add(contact(2.2, 1.9, x, z));
      }
    }

    // Atril central: donde termina el recorrido.
    group.add(box(0.8, 0.055, 0.58, 0, 1.09, -3.2, DARK));
    const column = new Mesh(new CylinderGeometry(0.085, 0.16, 1.06, 20), material(WOOD_FINE));
    column.position.set(0, 0.53, -3.2);
    column.castShadow = quality === "high";
    group.add(column);
    const book = emissive(0.68, 0.48, PALETTE.bone);
    book.rotation.x = -Math.PI / 2.3;
    book.position.set(0, 1.14, -3.17);
    group.add(book);
    // La biblioteca se cierra con estantes en ambos muros y ahoga la luz de la
    // ventana. Medido: con 16 de intensidad la sala salía a 234/255 de
    // luminancia media contra 181-211 del resto. Este valor la alinea.
    const readingLight = new PointLight(0xfff0d6, 6.5, 5.2, 2);
    readingLight.position.set(0, 2.0, -3.2);
    group.add(readingLight);
    group.add(contact(1.7, 1.5, 0, -3.2));

    return group;
  }

  const BUILDERS = [reception, privateOffice, archive, meetingRoom, lawLibrary];

  const scene = new Scene();
  scene.background = new Color(PALETTE.subtle);
  scene.fog = new Fog(PALETTE.subtle, 11, 38);

  // Sin environment map un material PBR no tiene nada que reflejar y se lee
  // como plástico. RoomEnvironment da especularidad creíble sin cargar un HDRI.
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();
  disposables.push(environment);

  const camera = new PerspectiveCamera(40, 1, 0.1, 120);

  const lastRoom = CHAPTERS.length - 1;
  const totalDepth = CHAPTERS.length * PITCH + 2;
  const midZ = -((CHAPTERS.length - 1) * PITCH) / 2;

  // Piso, techo y muros laterales continuos. Ninguno proyecta sombra.
  scene.add(
    box(
      ROOM.width,
      0.1,
      totalDepth,
      0,
      -0.05,
      midZ,
      // Roble cálido: el gris del token de fondo leía como concreto abstracto.
      { color: 0x8b6f42, roughness: 0.58, grain: "plank", repeat: [4, 14] },
      false,
    ),
  );
  scene.add(
    box(
      ROOM.width,
      0.1,
      totalDepth,
      0,
      ROOM.height + 0.05,
      midZ,
      { color: PALETTE.bone, roughness: 0.97, grain: "plaster", repeat: [4, 20] },
      false,
    ),
  );
  for (const side of [-1, 1]) {
    const x = (side * (ROOM.width + ROOM.wall)) / 2;
    scene.add(box(ROOM.wall, ROOM.height, totalDepth, x, ROOM.height / 2, midZ, WALL, false));
    // Zócalo: detalle mínimo que separa muro de piso y da acabado.
    scene.add(
      box(0.06, 0.11, totalDepth, x - (side * ROOM.wall) / 2 - side * 0.03, 0.055, midZ, WOOD_FINE, false),
    );
  }
  scene.add(
    box(ROOM.width, ROOM.height, ROOM.wall, 0, ROOM.height / 2, roomCenterZ(lastRoom) - ROOM.depth / 2, WALL, false),
  );

  const stops: Vector3[] = [];
  const focuses: Vector3[] = [];

  // La pantalla vive en su propia escena porque CSS3DRenderer mantiene un
  // grafo aparte. Comparte la cámara, así que sigue la perspectiva exacta.
  const OFFICE = 1;
  const screenPosition = new Vector3(-1.9, 1.3, roomCenterZ(OFFICE) - 2.886);
  const cssScene = new Scene();
  const cssRenderer = screenMount ? new CSS3DRenderer({ element: screenMount.host }) : null;
  let screenObject: CSS3DObject | null = null;
  if (screenMount && cssRenderer) {
    screenObject = new CSS3DObject(screenMount.element);
    // El elemento mide 1320x825 px y CSS3D mapea 1px a 1 unidad: 0.001 lo
    // deja en 1.32 x 0.825 m, justo dentro del bisel del monitor.
    screenObject.scale.setScalar(0.001);
    screenObject.position.copy(screenPosition);
    cssScene.add(screenObject);
  }

  CHAPTERS.forEach((chapter, index) => {
    const z = roomCenterZ(index);

    if (index < lastRoom) {
      scene.add(partition(z - ROOM.depth / 2 - ROOM.wall / 2, doorwayOffsetX(index)));
    }

    scene.add(windowUnit(chapter.windowSide, z + 0.5));
    scene.add(ceilingFixture(z - 1.4));
    scene.add(framedPanel((-chapter.windowSide) as 1 | -1, z - 2.4, chapter.accent));

    const furniture = BUILDERS[index](chapter.accent);
    furniture.position.z = z;
    scene.add(furniture);

    // Relleno frío de la ventana. Un punto por sala; el sol hace el resto.
    const daylight = new PointLight(0xdfeaf2, quality === "high" ? 16 : 12, 15, 2);
    daylight.position.set((chapter.windowSide * ROOM.width) / 2 - chapter.windowSide * 1.0, 2.1, z + 0.5);
    scene.add(daylight);

    stops.push(new Vector3(chapter.cameraX, EYE_HEIGHT, z + chapter.cameraZ));
    focuses.push(new Vector3(chapter.focus.x, chapter.focus.y, z + chapter.focus.z));
  });

  // Relleno bajo a propósito: el contraste es lo que hace legible el volumen.
  scene.add(new AmbientLight(0xeef0f2, 0.2));
  scene.add(new HemisphereLight(0xf7f4ee, 0x6f6a62, 0.26));

  // Sol rasante desde la ventana de la sala activa. El shadow map viaja con la
  // cámara, así que sus 2048px cubren la sala visible en vez de repartirse
  // sobre los cuarenta y seis metros del enfilade.
  const sunIntensity = quality === "high" ? 6.4 : 4.2;
  const sun = new DirectionalLight(0xfff2dc, sunIntensity);
  sun.castShadow = quality === "high";
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 6;
  sun.shadow.camera.bottom = -6;
  // El sol se coloca a ~11m de su objetivo, así que un far de 30 desperdiciaba
  // la mitad del rango de profundidad y las barras finas del parteluz salían
  // con shadow acne. Con 19 el mapa gana precisión donde importa.
  sun.shadow.camera.near = 3;
  sun.shadow.camera.far = 19;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.05;
  // Penumbra: una barra de 6cm proyecta borde suave, no una línea dura.
  sun.shadow.radius = 2.5;
  scene.add(sun);
  scene.add(sun.target);

  // Tramos de cámara: un bezier por tránsito, con el control en el vano, para
  // que la cámara cruce la puerta en vez de cortar la esquina.
  const legs: QuadraticBezierCurve3[] = [];
  for (let index = 0; index < lastRoom; index += 1) {
    const control = new Vector3(
      doorwayOffsetX(index),
      EYE_HEIGHT,
      roomCenterZ(index) - ROOM.depth / 2 - ROOM.wall / 2,
    );
    legs.push(new QuadraticBezierCurve3(stops[index], control, stops[index + 1]));
  }

  const position = new Vector3();
  const target = new Vector3();

  function update(pathT: number, elapsed: number, breathe: boolean) {
    const clamped = pathT < 0 ? 0 : pathT > 1 ? 1 : pathT;
    const scaled = clamped * lastRoom;
    const leg = Math.min(Math.floor(scaled), lastRoom - 1);
    const local = scaled - leg;

    legs[leg].getPoint(local, position);
    target.copy(focuses[leg]).lerp(focuses[leg + 1], local);

    if (breathe) {
      position.y += Math.sin(elapsed * 0.45) * 0.013;
      position.x += Math.sin(elapsed * 0.31 + 1.7) * 0.017;
      target.y += Math.sin(elapsed * 0.37) * 0.009;
    }

    camera.position.copy(position);
    camera.lookAt(target);

    // El lado de la ventana alterna sala a sala, así que elegirlo con un
    // redondeo hacía saltar el sol de un costado del edificio al otro en un
    // solo fotograma: medido, un pico de diferencia de 74 contra una media de
    // 3.5 al cruzar el vano. Se conserva el escalón — un sol no interpola su
    // posición atravesando el edificio — pero la intensidad cae en el umbral,
    // que además es lo correcto: dentro de un vano no hay ventana.
    const sideFrom = CHAPTERS[leg].windowSide;
    const sideTo = CHAPTERS[leg + 1].windowSide;
    const side = local < 0.5 ? sideFrom : sideTo;
    const crossing = sideFrom === sideTo ? 1 : 1 - 0.72 * Math.exp(-((local - 0.5) ** 2) / 0.014);
    sun.intensity = sunIntensity * crossing;
    sun.position.set(side * (ROOM.width / 2 + 5.5), 3.4, position.z + 2.2);
    sun.target.position.set(-side * 2.2, 0.75, position.z - 3.4);
    sun.target.updateMatrixWorld();

    // El DOM siempre se dibuja encima del WebGL, así que la pantalla debe
    // ocultarse fuera de su sala o se vería atravesando los muros.
    if (screenObject) {
      const ahead = position.z > screenPosition.z + 0.4;
      const near = Math.abs(position.z - screenPosition.z) < 7.5;
      screenObject.visible = ahead && near;
    }
  }

  function resize(width: number, height: number) {
    const aspect = width / height;
    camera.aspect = aspect;
    // En retrato un FOV fijo recorta los lados y deja techo vacío arriba. Se
    // abre el vertical a medida que la pantalla se angosta, con tope para no
    // caer en la distorsión de gran angular.
    const widened = 40 + (1.2 - Math.min(aspect, 1.2)) * 24;
    camera.fov = Math.min(58, widened);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, quality === "high" ? 2 : 1.25));
    renderer.setSize(width, height, false);
    composer?.setSize(width, height);
    cssRenderer?.setSize(width, height);
  }

  function dispose() {
    scene.traverse((node) => {
      if (node instanceof Mesh) {
        if (node.geometry !== UNIT_BOX && node.geometry !== UNIT_PLANE) node.geometry.dispose();
        const mat = node.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat instanceof MeshBasicMaterial) mat.dispose();
      }
    });
    disposables.forEach((item) => item.dispose());
    UNIT_BOX.dispose();
    UNIT_PLANE.dispose();
    renderer.dispose();
  }

  // Oclusión ambiental. Es lo que separa un render básico de un interior
  // creíble: sin ella las esquinas, los rincones bajo los muebles y los
  // encuentros muro-piso reciben la misma luz que una superficie abierta.
  const composer = quality === "high" ? new EffectComposer(renderer) : null;
  if (composer) {
    composer.addPass(new RenderPass(scene, camera));
    const gtao = new GTAOPass(scene, camera);
    gtao.updateGtaoMaterial({
      // Radio en unidades de escena: 62cm capta el encuentro muro-piso y el
      // hueco bajo un mueble sin ensuciar superficies abiertas.
      radius: 0.62,
      distanceExponent: 1.6,
      thickness: 0.45,
      scale: 1,
      samples: 16,
      distanceFallOff: 1,
      screenSpaceRadius: false,
    });
    gtao.blendIntensity = 1;
    composer.addPass(gtao);
    composer.addPass(new OutputPass());
  }

  update(0, 0, false);

  return {
    scene,
    camera,
    renderer,
    update,
    resize,
    render: () => {
      if (composer) composer.render();
      else renderer.render(scene, camera);
      if (cssRenderer) cssRenderer.render(cssScene, camera);
    },
    dispose,
  };
}

export type Despacho = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  /** Coloca la cámara para una posición normalizada del recorrido. */
  update(pathT: number, elapsed: number, breathe: boolean): void;
  resize(width: number, height: number): void;
  render(): void;
  dispose(): void;
};
