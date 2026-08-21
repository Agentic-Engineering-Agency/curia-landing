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

const KEY_HIGH = 4.85;
const KEY_LOW = 3.65;
const WINDOW_FILL_HIGH = 3.1;
const WINDOW_FILL_LOW = 2.45;
const FOCAL_HIGH = 1.15;
const FOCAL_LOW = 0.9;
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
  // Con parches fotográficos la textura ya trae variación y sombra horneada:
  // la bruma sólo debe cerrar el enfilade lejano, no sumar otra capa gris sobre
  // el muro activo ni levantar negros que pertenecen a la foto.
  scene.fog = new Fog(PALETTE.subtle, 14, 44);
  const environment = createStudioEnvironment();
  scene.environment = environment;
  scene.environmentIntensity = quality === "high" ? 0.42 : 0.36;

  // El rig anterior compensaba texturas dibujadas casi planas con una clave de
  // mucho contraste. En las fotos ese contraste ya viene dentro del albedo, así
  // que el volumen ahora descansa en un suelo ambiental suave y estable.
  const ambient = new AmbientLight(0xe7eef0, quality === "high" ? 0.18 : 0.17);
  const bounce = new HemisphereLight(0xe5eef4, 0x756447, quality === "high" ? 0.36 : 0.32);

  // Una sola luz fría sigue viajando al hueco activo para mantener la lectura de
  // ventana sin pagar cinco puntos por frame. Su intensidad sube apenas porque
  // ahora hace de relleno blando, no de foco que dibuje otra sombra sobre la
  // sombra ya impresa en el parche del piso.
  const windowFill = new PointLight(0xdcecff, quality === "high" ? WINDOW_FILL_HIGH : WINDOW_FILL_LOW, 7.4, 2.55);

  // La luz dinámica nueva se conserva, pero deja de ser protagonista: con madera
  // fotográfica basta un borde cálido débil para separar cantos sin producir
  // brillos que contradigan la iluminación horneada de la textura.
  const focalPool = new PointLight(INTERIOR_WARM, quality === "high" ? FOCAL_HIGH : FOCAL_LOW, 3.1, 3.65);
  focalPool.castShadow = false;

  // La clave solar sólo debe anclar hora y parteluz. Al bajarla y suavizar su
  // mapa, las barras sobreviven como rastro de hora, pero no compiten con
  // sombras suaves que ya existen en los parches fotográficos de piso y muro.
  const sun = new DirectionalLight(0xffe0b3, quality === "high" ? KEY_HIGH : KEY_LOW);
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
  sun.shadow.radius = quality === "high" ? 1.65 : 1.25;
  sun.shadow.camera.updateProjectionMatrix();

  scene.add(ambient, bounce, windowFill, focalPool, sun, sun.target);

  const focalPosition = new Vector3();

  function aim(cameraPosition: Vector3, windowSide: 1 | -1, crossing: number) {
    const occlusion = Math.max(0.24, Math.min(1, crossing));
    const roomProgress = activeRoomProgress(cameraPosition.z);
    const roomZ = -roomProgress * PITCH;
    // El PMREM de `despacho-scene` se instala después de crear este rig. Con
    // materiales fotográficos lo dejamos más presente: aporta luz ambiental
    // especular de baja frecuencia, no una segunda dirección de sombra.
    scene.environmentIntensity = (quality === "high" ? 0.36 : 0.31) * (0.9 + occlusion * 0.1);

    // El sol sigue viajando con la cámara para concentrar el shadow map en la
    // sala visible, pero su peso baja: el parteluz marca lugar y hora sin
    // ensuciar el piso con una segunda sombra dura en otro ángulo.
    sun.intensity = (quality === "high" ? KEY_HIGH : KEY_LOW) * (0.12 + occlusion * 0.56);
    sun.position.set(windowSide * (ROOM.width / 2 + 6.55), 2.55, cameraPosition.z + 1.72);
    sun.target.position.set(-windowSide * 2.8, 0.58, cameraPosition.z - 3.75);
    sun.target.updateMatrixWorld();

    // Al cruzar un vano cae porque no hay fuente narrativa ahí, pero el mínimo
    // queda más alto que antes para que las fotos no pierdan su luminancia media
    // ni aparezcan negros aplastados por doble sombreado.
    windowFill.intensity = (quality === "high" ? WINDOW_FILL_HIGH : WINDOW_FILL_LOW) * (0.24 + occlusion * 0.52);
    windowFill.position.set(windowSide * (ROOM.width / 2 - 0.84), 2.28, roomZ + 0.12);

    focalPointAt(roomProgress, focalPosition);
    // El borde cálido acompaña al lado de ventana y no al centro de la sala: así
    // separa perfiles de madera sin parecer una lámpara frontal añadida encima
    // de la luz que ya trae horneada el material.
    focalPosition.set(
      focalPosition.x * 0.24 + windowSide * (ROOM.width / 2 - 0.72) * 0.76,
      Math.min(ROOM.height - 0.68, focalPosition.y + 0.18),
      focalPosition.z - 0.58,
    );
    focalPool.intensity = (quality === "high" ? FOCAL_HIGH : FOCAL_LOW) * (0.06 + occlusion * 0.5);
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
