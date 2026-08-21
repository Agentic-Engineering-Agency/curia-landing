// Kit compartido de construcción de escena.
//
// Es el contrato entre el ensamblado y cada sala: los constructores de sala
// reciben este objeto y no importan nada de three directamente para materiales
// ni volúmenes. Cachea material, textura y mapa de normales por firma, así que
// dos salas que usen la misma superficie comparten GPU.

import {
  BoxGeometry,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE } from "./rooms";
import {
  fabricTexture,
  normalFromTexture,
  plankTexture,
  plasterTexture,
  roughnessNoise,
  woodTexture,
  type Repeat,
} from "./textures";

export type Grain = "wood" | "plank" | "plaster" | "fabric" | "none";

export type Surface = {
  color: number;
  roughness?: number;
  metalness?: number;
  grain?: Grain;
  repeat?: Repeat;
};

/** Geometrías unitarias compartidas: una caja escalada evita miles de buffers. */
const UNIT_BOX = new BoxGeometry(1, 1, 1);
const UNIT_PLANE = new PlaneGeometry(1, 1);

/** Superficies base del despacho. Toda sala parte de estas. */
export const SURFACES = {
  wall: { color: PALETTE.subtle, roughness: 0.96, grain: "plaster", repeat: 4 },
  // Rugosidades bajas a propósito: con 0.55 la madera no devolvía reflejo y se
  // leía como pintura mate. Un barniz de oficina tiene brillo.
  wood: { color: PALETTE.amber, roughness: 0.42, grain: "wood", repeat: 2 },
  woodFine: { color: PALETTE.amber, roughness: 0.38, grain: "wood", repeat: 1 },
  dark: { color: 0x2b3239, roughness: 0.5, grain: "fabric", repeat: 3 },
  metal: { color: PALETTE.borderStrong, roughness: 0.24, metalness: 0.7 },
  paper: { color: PALETTE.bone, roughness: 0.92 },
} satisfies Record<string, Surface>;

export type SceneKit = {
  /** true cuando la calidad permite sombras y antialias. */
  high: boolean;
  /** Superficies base. */
  S: typeof SURFACES;
  material(surface: Surface): MeshStandardMaterial;
  /** Caja por centro. `casts` false para arquitectura, que sólo recibe sombra. */
  box(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    surface: Surface,
    casts?: boolean,
  ): Mesh;
  /** Caja con filo redondeado, para lo que la cámara ve de cerca. */
  rbox(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    surface: Surface,
    casts?: boolean,
    radius?: number,
  ): Mesh;
  /** Plano de color puro, sin tone mapping: pantallas, luminarias, papel. */
  emissive(width: number, height: number, color: number): Mesh;
  /** Sombra de contacto bajo un mueble. Ancla el objeto al piso a coste cero. */
  contact(width: number, depth: number, x: number, z: number): Mesh;
  /** Registra algo para liberar al destruir la escena. */
  track(item: { dispose(): void }): void;
  dispose(): void;
};

/** Relieve por tipo de material: la duela marca junta, el yeso casi nada. */
const NORMAL_STRENGTH: Record<Grain, number> = {
  wood: 2.6,
  plank: 4.2,
  fabric: 2.2,
  plaster: 1.1,
  none: 0,
};

export function createSceneKit(quality: "high" | "low"): SceneKit {
  const high = quality === "high";
  const roughnessMap = roughnessNoise(6);
  const textureCache = new Map<string, CanvasTexture>();
  const normalCache = new Map<CanvasTexture, CanvasTexture>();
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
    const { color, roughness = 0.85, metalness = 0, grain = "none", repeat = 1 } = surface;
    const key = `${color}|${roughness}|${metalness}|${grain}|${repeat}`;
    const cached = materialCache.get(key);
    if (cached) return cached;

    const map = grainTexture(grain, color, repeat);
    const result = new MeshStandardMaterial({
      color: map ? 0xffffff : color,
      map: map ?? null,
      normalMap: normalFor(grain, map),
      roughnessMap,
      // El environment map es lo que produce el brillo especular que distingue
      // madera barnizada y metal de pintura mate.
      envMapIntensity: 1.15,
      roughness,
      metalness,
    });
    materialCache.set(key, result);
    disposables.push(result);
    return result;
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

  return {
    high,
    S: SURFACES,
    material,

    box(width, height, depth, x, y, z, surface, casts = true) {
      const mesh = new Mesh(UNIT_BOX, material(surface));
      mesh.scale.set(width, height, depth);
      mesh.position.set(x, y, z);
      mesh.castShadow = casts && high;
      mesh.receiveShadow = true;
      return mesh;
    },

    rbox(width, height, depth, x, y, z, surface, casts = true, radius = 0.016) {
      const safe = Math.min(radius, Math.min(width, height, depth) / 2.05);
      const geometry = new RoundedBoxGeometry(width, height, depth, 2, safe);
      disposables.push(geometry);
      const mesh = new Mesh(geometry, material(surface));
      mesh.position.set(x, y, z);
      mesh.castShadow = casts && high;
      mesh.receiveShadow = true;
      return mesh;
    },

    emissive(width, height, color) {
      const mesh = new Mesh(UNIT_PLANE, new MeshBasicMaterial({ color, toneMapped: false }));
      mesh.scale.set(width, height, 1);
      return mesh;
    },

    contact(width, depth, x, z) {
      const mesh = new Mesh(
        UNIT_PLANE,
        new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.set(width, depth, 1);
      mesh.position.set(x, 0.014, z);
      return mesh;
    },

    track(item) {
      disposables.push(item);
    },

    dispose() {
      disposables.forEach((item) => item.dispose());
      UNIT_BOX.dispose();
      UNIT_PLANE.dispose();
    },
  };
}
