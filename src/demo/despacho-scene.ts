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
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PCFSoftShadowMap,
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
import { createCameraPath } from "./camera-path";
import { createLighting } from "./lighting";
import { createSceneKit } from "./scene-kit";
import { createWallContent } from "./wall-content";
import { build as buildRecepcion } from "./salas/recepcion";
import { build as buildOficina } from "./salas/oficina";
import { build as buildArchivo } from "./salas/archivo";
import { build as buildJuntas } from "./salas/juntas";
import { build as buildBiblioteca } from "./salas/biblioteca";
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

  // El kit compartido cachea material, textura y normal map por firma. Las
  // salas lo reciben y no importan three para materiales ni volumenes.
  const kit = createSceneKit(quality);
  const { box, rbox, emissive, contact } = kit;
  const {
    wall: WALL,
    wood: WOOD,
    woodFine: WOOD_FINE,
    dark: DARK,
    metal: METAL,
    paper: PAPER,
  } = kit.S;



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


  // Una sala por modulo: el trabajo de arte de cada una es independiente.
  const BUILDERS = [
    buildRecepcion,
    buildOficina,
    buildArchivo,
    buildJuntas,
    buildBiblioteca,
  ];


  const scene = new Scene();

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

    const furniture = BUILDERS[index](kit, chapter.accent);
    furniture.position.z = z;
    scene.add(furniture);

    // El relleno de ventana ya no es una luz por sala: lighting.ts mueve una
    // sola al hueco activo. Cinco luces puntuales entraban al sombreado de
    // todos los fragmentos visibles aunque la escena estuviera quieta.

  });

  // Rig de luz y recorrido de cámara viven en sus módulos: la escena sólo los
  // orienta por frame.
  const lighting = createLighting(scene, quality);

  // El environment map se conserva con PMREM sobre RoomEnvironment en vez del
  // equirectangular mínimo del módulo: cuesta una sola vez al arrancar y da
  // reflejo especular bastante más creíble en madera barnizada y metal.
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();
  kit.track(environment);

  const cameraPath = createCameraPath();

  // Contenido de la landing montado sobre los muros, no flotando sobre el
  // viewport. Comparte la escena CSS3D con la pantalla del monitor.
  const wallPanels = Array.from(
    document.querySelectorAll<HTMLElement>("[data-wall-panel]"),
  );
  const wallContent =
    cssRenderer && wallPanels.length ? createWallContent(cssScene, wallPanels) : null;

  const position = new Vector3();
  const target = new Vector3();

  function update(pathT: number, elapsed: number, breathe: boolean) {
    const clamped = pathT < 0 ? 0 : pathT > 1 ? 1 : pathT;
    const scaled = clamped * lastRoom;
    const leg = Math.min(Math.floor(scaled), lastRoom - 1);
    const local = scaled - leg;

    cameraPath.sample(clamped, position, target);

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
    lighting.aim(position, side, crossing);

    wallContent?.update(position);

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
        const mat = node.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat instanceof MeshBasicMaterial) mat.dispose();
      }
    });
    wallContent?.dispose();
    lighting.dispose();
    kit.dispose();
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
