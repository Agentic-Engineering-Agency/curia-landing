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

const KEY_HIGH = 8.2;
const KEY_LOW = 6.1;
const WINDOW_FILL_HIGH = 4.8;
const WINDOW_FILL_LOW = 3.35;
const FOCAL_HIGH = 3.15;
const FOCAL_LOW = 2.15;
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

  // El ambiente queda como suelo de lectura, no como luz protagonista. Bajar
  // estos valores es gratis en GPU y permite que la clave lateral y el realce
  // focal modelen volumen en vez de sumar una capa gris uniforme.
  const ambient = new AmbientLight(0xdce6ea, quality === "high" ? 0.075 : 0.105);
  const bounce = new HemisphereLight(0xdceaf3, 0x5f513e, quality === "high" ? 0.16 : 0.15);

  // Antes había un PointLight por sala. Aunque la escena esté quieta, cada luz
  // dinámica entra al sombreado de todos los fragmentos visibles. Una sola luz
  // fría viaja a la ventana activa: misma lectura de cielo, cinco veces menos
  // luces puntuales en el shader y menos relleno plano hacia los bordes.
  const windowFill = new PointLight(0xdcecff, quality === "high" ? WINDOW_FILL_HIGH : WINDOW_FILL_LOW, 8.8, 2.55);

  // Se paga exactamente una luz dinámica nueva, puntual y sin sombra. Su alcance
  // corto crea jerarquía de luminancia sobre el sujeto de cada capítulo sin un
  // pass de viñeta ni cinco luminarias residentes en el shader.
  const focalPool = new PointLight(INTERIOR_WARM, quality === "high" ? FOCAL_HIGH : FOCAL_LOW, 4.15, 2.7);
  focalPool.castShadow = false;

  // La oclusión ambiental de pantalla completa costaba justo lo que el cliente
  // sintió: un pass GTAO recalculado por frame sobre todo el viewport. Para un
  // despacho estático conviene pagar sombras reales concentradas, contactos
  // geométricos (`kit.contact`) y niebla; no un sombreado screen-space que
  // reinterpreta cada píxel en cada scroll.
  const sun = new DirectionalLight(0xffe2ba, quality === "high" ? KEY_HIGH : KEY_LOW);
  sun.castShadow = quality === "high";
  sun.shadow.mapSize.set(quality === "high" ? 2048 : 1024, quality === "high" ? 2048 : 1024);
  sun.shadow.camera.left = -6.6;
  sun.shadow.camera.right = 6.6;
  sun.shadow.camera.top = 4.8;
  sun.shadow.camera.bottom = -4.8;
  sun.shadow.camera.near = 4;
  sun.shadow.camera.far = 18;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.045;
  sun.shadow.radius = quality === "high" ? 2.25 : 1.35;
  sun.shadow.camera.updateProjectionMatrix();

  scene.add(ambient, bounce, windowFill, focalPool, sun, sun.target);

  const focalPosition = new Vector3();

  function aim(cameraPosition: Vector3, windowSide: 1 | -1, crossing: number) {
    const occlusion = Math.max(0.24, Math.min(1, crossing));
    const roomProgress = activeRoomProgress(cameraPosition.z);
    const roomZ = -roomProgress * PITCH;

    // El sol sigue a la cámara para que los 2048px del shadow map caigan en la
    // sala visible, no repartidos por todo el enfilade. La clave queda más
    // lateral: no añade coste, pero separa una mitad de ventana y una mitad en
    // sombra para que los planos de madera, metal y papel tengan lectura.
    sun.intensity = (quality === "high" ? KEY_HIGH : KEY_LOW) * occlusion;
    sun.position.set(windowSide * (ROOM.width / 2 + 6.15), 3.18, cameraPosition.z + 2.1);
    sun.target.position.set(-windowSide * 2.45, 0.72, cameraPosition.z - 3.45);
    sun.target.updateMatrixWorld();

    // El relleno azul sólo recupera material del lado de ventana. Al acortar
    // alcance e intensidad evitamos que lave la pared opuesta; cuando se cruza
    // un vano cae porque allí no hay fuente narrativa.
    windowFill.intensity = (quality === "high" ? WINDOW_FILL_HIGH : WINDOW_FILL_LOW) * (0.2 + occlusion * 0.55);
    windowFill.position.set(windowSide * (ROOM.width / 2 - 0.92), 2.12, roomZ + 0.35);

    focalPointAt(roomProgress, focalPosition);
    focalPool.intensity = (quality === "high" ? FOCAL_HIGH : FOCAL_LOW) * (0.34 + occlusion * 0.66);
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
