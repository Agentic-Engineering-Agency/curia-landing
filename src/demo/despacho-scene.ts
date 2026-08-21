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
import { createSceneKit } from "./scene-kit";
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
  scene.background = new Color(PALETTE.subtle);
  scene.fog = new Fog(PALETTE.subtle, 11, 38);

  // Sin environment map un material PBR no tiene nada que reflejar y se lee
  // como plástico. RoomEnvironment da especularidad creíble sin cargar un HDRI.
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();
  kit.track(environment);

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

    const furniture = BUILDERS[index](kit, chapter.accent);
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
        const mat = node.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat instanceof MeshBasicMaterial) mat.dispose();
      }
    });
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
