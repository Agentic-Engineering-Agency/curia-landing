import {
  AmbientLight,
  Color,
  DataTexture,
  DirectionalLight,
  EquirectangularReflectionMapping,
  Fog,
  HemisphereLight,
  PointLight,
  RGBAFormat,
  Scene,
  SRGBColorSpace,
  Vector3,
} from "three";

import { CHAPTERS, PALETTE, PITCH, ROOM } from "./rooms";

export type Lighting = {
  /** Orienta el sol para la sala activa. `crossing` baja la intensidad al pasar un vano. */
  aim(cameraPosition: Vector3, windowSide: 1 | -1, crossing: number): void;
  dispose(): void;
};

const KEY_HIGH = 10.15;
const KEY_LOW = 7.15;
const WINDOW_FILL_HIGH = 2.15;
const WINDOW_FILL_LOW = 1.75;
const FOCAL_HIGH = 3.15;
const FOCAL_LOW = 2.25;
const MAX_ROOM_INDEX = CHAPTERS.length - 1;
const FOCUS_BLEND_HALF_WIDTH = 0.12;
const INTERIOR_WARM = new Color(PALETTE.amber).lerp(new Color(PALETTE.bone), 0.36);

const FOCAL_POINTS = CHAPTERS.map((chapter, index) => {
  return new Vector3(
    chapter.focus.x,
    Math.min(ROOM.height - 0.5, chapter.focus.y + 1.05),
    -index * PITCH + chapter.focus.z + 0.22,
  );
});

export function createLighting(scene: Scene, quality: "high" | "low"): Lighting {
  const previousBackground = scene.background;
  const previousFog = scene.fog;
  const previousEnvironment = scene.environment;
  const previousEnvironmentIntensity = scene.environmentIntensity;

  scene.background = new Color(PALETTE.subtle);
  // La niebla demasiado cercana iguala valores y aplana los muros. Empujar el
  // rango no cuesta más: el cálculo ya existe, sólo deja que el contraste viva
  // en la sala activa y reserva la bruma para el fondo del enfilade.
  scene.fog = new Fog(PALETTE.subtle, 12.5, 42);

  // Sin environment map el PBR pierde reflejo y los metales se vuelven mate.
  // La firma del módulo no recibe renderer, así que en vez de reconstruir
  // PMREM/RoomEnvironment aquí usamos un equirectangular mínimo y estático:
  // conserva brillo especular sin añadir un pass ni trabajo por frame.
  const environment = createStudioEnvironment();
  scene.environment = environment;
  scene.environmentIntensity = quality === "high" ? 0.36 : 0.3;

  // El ambiente queda como suelo de lectura, no como luz protagonista. En esta
  // ronda lo bajamos otro escalón porque la crítica ya no era "falta detalle",
  // sino "todo vale lo mismo": el volumen nace de una clave lateral con relleno
  // frío mínimo, no de subir la exposición global.
  const ambient = new AmbientLight(0xdce6ea, quality === "high" ? 0.035 : 0.065);
  const bounce = new HemisphereLight(0xdceaf3, 0x4d3f2f, quality === "high" ? 0.09 : 0.1);

  // Antes había un PointLight por sala. Aunque la escena esté quieta, cada luz
  // dinámica entra al sombreado de todos los fragmentos visibles. Una sola luz
  // fría viaja a la ventana activa: conserva lectura de cielo, pero con menos
  // alcance para no borrar la mitad en sombra ni lavar las barras del parteluz.
  const windowFill = new PointLight(0xdcecff, quality === "high" ? WINDOW_FILL_HIGH : WINDOW_FILL_LOW, 6.65, 2.85);

  // Se paga exactamente una luz dinámica nueva, puntual y sin sombra. En vez de
  // funcionar como lámpara frontal, viaja cerca del lado de ventana y recorta en
  // cálido los cantos de muebles y marcos: coste igual que la ronda anterior,
  // más jerarquía por colocación, sin pass de viñeta ni cinco luces residentes.
  const focalPool = new PointLight(INTERIOR_WARM, quality === "high" ? FOCAL_HIGH : FOCAL_LOW, 3.35, 3.45);
  focalPool.castShadow = false;

  // La oclusión ambiental de pantalla completa costaba justo lo que el cliente
  // sintió: un pass GTAO recalculado por frame sobre todo el viewport. Para un
  // despacho estático conviene pagar sombras reales concentradas, contactos
  // geométricos (`kit.contact`) y niebla; no un sombreado screen-space que
  // reinterpreta cada píxel en cada scroll.
  const sun = new DirectionalLight(0xffe2ba, quality === "high" ? KEY_HIGH : KEY_LOW);
  sun.castShadow = quality === "high";
  sun.shadow.mapSize.set(quality === "high" ? 2048 : 1024, quality === "high" ? 2048 : 1024);
  sun.shadow.camera.left = -6.15;
  sun.shadow.camera.right = 6.15;
  sun.shadow.camera.top = 4.35;
  sun.shadow.camera.bottom = -4.35;
  sun.shadow.camera.near = 3.5;
  sun.shadow.camera.far = 17;
  sun.shadow.bias = -0.00038;
  sun.shadow.normalBias = 0.028;
  sun.shadow.radius = quality === "high" ? 0.8 : 0.65;
  sun.shadow.camera.updateProjectionMatrix();

  scene.add(ambient, bounce, windowFill, focalPool, sun, sun.target);

  const focalPosition = new Vector3();

  function aim(cameraPosition: Vector3, windowSide: 1 | -1, crossing: number) {
    const occlusion = Math.max(0.24, Math.min(1, crossing));
    const roomProgress = activeRoomProgress(cameraPosition.z);
    const roomZ = -roomProgress * PITCH;
    // El PMREM de `despacho-scene` se instala después de crear este rig y
    // vuelve a subir `environmentIntensity`; lo fijamos aquí porque el reflejo
    // ambiental debe dar material, no actuar como una segunda luz plana.
    scene.environmentIntensity = (quality === "high" ? 0.28 : 0.24) * (0.82 + occlusion * 0.18);

    // El sol sigue a la cámara para que los 2048px del shadow map caigan en la
    // sala visible, no repartidos por todo el enfilade. Lo bajamos y lo hacemos
    // más oblicuo: el techo sigue sin proyectar, pero el parteluz sí dibuja
    // barras más legibles y los estantes dejan sombra bajo cada repisa.
    sun.intensity = (quality === "high" ? KEY_HIGH : KEY_LOW) * (0.08 + occlusion * 0.92);
    sun.position.set(windowSide * (ROOM.width / 2 + 6.55), 2.55, cameraPosition.z + 1.72);
    sun.target.position.set(-windowSide * 2.8, 0.58, cameraPosition.z - 3.75);
    sun.target.updateMatrixWorld();

    // El relleno azul sólo rescata material del lado de ventana. La caída al
    // cruzar un vano queda marcada porque allí no hay fuente narrativa; si se
    // mantiene alto, el render vuelve a verse cenital y sin dirección.
    windowFill.intensity = (quality === "high" ? WINDOW_FILL_HIGH : WINDOW_FILL_LOW) * (0.06 + occlusion * 0.58);
    windowFill.position.set(windowSide * (ROOM.width / 2 - 0.84), 2.28, roomZ + 0.12);

    focalPointAt(roomProgress, focalPosition);
    // La luz de borde usa la misma luminaria dinámica de la ronda anterior:
    // se desplaza hacia la ventana y un poco hacia el fondo para que el brillo
    // rasante se lea en cantos, no como un foco plano sobre el centro.
    focalPosition.set(
      focalPosition.x * 0.24 + windowSide * (ROOM.width / 2 - 0.72) * 0.76,
      Math.min(ROOM.height - 0.68, focalPosition.y + 0.18),
      focalPosition.z - 0.58,
    );
    focalPool.intensity = (quality === "high" ? FOCAL_HIGH : FOCAL_LOW) * (0.12 + occlusion * 0.88);
    focalPool.position.copy(focalPosition);
  }

  aim(new Vector3(0, 1.56, 3), 1, 1);

  return {
    aim,
    dispose() {
      scene.remove(ambient, bounce, windowFill, focalPool, sun, sun.target);
      environment.dispose();
      sun.shadow.dispose();
      scene.background = previousBackground;
      scene.fog = previousFog;
      scene.environment = previousEnvironment;
      scene.environmentIntensity = previousEnvironmentIntensity;
    },
  };
}

// No usamos Math.round para dependencias de sala activa: al llegar al vano se
// interpola una franja estrecha, de modo que el realce y el relleno viajan sin
// teletransportarse mientras su intensidad está en caída.
function activeRoomProgress(cameraZ: number) {
  const raw = Math.max(0, Math.min(MAX_ROOM_INDEX, -cameraZ / PITCH));
  const lower = Math.floor(raw);
  if (lower >= MAX_ROOM_INDEX) return MAX_ROOM_INDEX;

  const fraction = raw - lower;
  const blendStart = 0.5 - FOCUS_BLEND_HALF_WIDTH;
  const blendEnd = 0.5 + FOCUS_BLEND_HALF_WIDTH;

  if (fraction <= blendStart) return lower;
  if (fraction >= blendEnd) return lower + 1;

  return lower + smoothstep((fraction - blendStart) / (blendEnd - blendStart));
}

function focalPointAt(progress: number, out: Vector3) {
  const lower = Math.floor(progress);
  const upper = Math.min(MAX_ROOM_INDEX, lower + 1);
  return out.lerpVectors(FOCAL_POINTS[lower], FOCAL_POINTS[upper], progress - lower);
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function createStudioEnvironment() {
  const width = 32;
  const height = 16;
  const data = new Uint8Array(width * height * 4);
  const top = toRgb(0xdbe8ef);
  const middle = toRgb(PALETTE.bone);
  const floor = toRgb(0x9a8155);

  for (let y = 0; y < height; y += 1) {
    const v = y / (height - 1);
    const from = v < 0.48 ? top : middle;
    const to = v < 0.48 ? middle : floor;
    const t = v < 0.48 ? v / 0.48 : (v - 0.48) / 0.52;

    for (let x = 0; x < width; x += 1) {
      const u = x / (width - 1);
      const sideGlow = Math.max(0, 1 - Math.abs(u - 0.22) / 0.18) * 18;
      const i = (y * width + x) * 4;
      data[i] = Math.min(255, lerp(from[0], to[0], t) + sideGlow);
      data[i + 1] = Math.min(255, lerp(from[1], to[1], t) + sideGlow);
      data[i + 2] = Math.min(255, lerp(from[2], to[2], t) + sideGlow);
      data[i + 3] = 255;
    }
  }

  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function toRgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function lerp(from: number, to: number, t: number) {
  return Math.round(from + (to - from) * t);
}
