import { ShaderMaterial } from "three";

import type { Despacho } from "./despacho-scene";

/**
 * Captura de profundidad para la tubería de paralaje. No entra en producción:
 * `main.ts` la importa sólo bajo `import.meta.env.DEV`.
 *
 * El mapa se usa para desplazar una fotografía en 3D, así que necesita
 * profundidad *lineal* en espacio de vista. La del buffer de profundidad no
 * sirve: está distribuida hiperbólicamente, casi toda su precisión pegada al
 * plano cercano, y desplazar con ella aplasta el fondo contra la cámara.
 */
let material: ShaderMaterial | null = null;

function materialProfundidad(): ShaderMaterial {
  material ??= new ShaderMaterial({
    uniforms: {
      cerca: { value: 0 },
      lejos: { value: 0 },
    },
    vertexShader: `
    varying float vProfundidad;
    void main() {
      vec4 vista = modelViewMatrix * vec4(position, 1.0);
      vProfundidad = -vista.z;
      gl_Position = projectionMatrix * vista;
    }
  `,
    fragmentShader: `
    uniform float cerca;
    uniform float lejos;
    varying float vProfundidad;
    void main() {
      float t = clamp((vProfundidad - cerca) / (lejos - cerca), 0.0, 1.0);
      gl_FragColor = vec4(vec3(t), 1.0);
    }
  `,
  });
  return material;
}

export type CapturaProfundidad = {
  /** Profundidad normalizada como data URL PNG, sin pérdida. */
  imagen: string;
  /** Metros que corresponden a 0 y a 1 en el mapa, para deshacer la escala. */
  cerca: number;
  lejos: number;
  /** Parámetros de cámara que hacen falta para reconstruir el encuadre. */
  fov: number;
  aspecto: number;
};

/**
 * Rango útil del mapa, en metros. Los planos de la cámara son 0.1 y 120, y
 * usarlos desperdicia el mapa: medido, la geometría en cuadro vive entre 1.9 y
 * 7.5 m, así que normalizar contra 120 dejaba 5 de los 256 niveles en uso, unos
 * 47 cm por nivel. Con este rango cada nivel vale 2.5 cm.
 */
const RANGO = { cerca: 1.5, lejos: 8.0 } as const;

/**
 * Renderiza el mapa de profundidad del recorrido en `pathT` sin tocar el estado
 * de la escena más allá del override, que se retira antes de volver.
 */
export function capturarProfundidad(
  despacho: Despacho,
  pathT: number,
): CapturaProfundidad {
  const { scene, camera, renderer } = despacho;

  despacho.update(pathT, 0, false);

  const material = materialProfundidad();
  const { cerca, lejos } = RANGO;
  material.uniforms.cerca.value = cerca;
  material.uniforms.lejos.value = lejos;

  const fondoPrevio = scene.background;
  const nieblaPrevia = scene.fog;
  const toneMappingPrevio = renderer.toneMapping;

  scene.overrideMaterial = material;
  scene.background = null;
  scene.fog = null;
  // Sin tone mapping: el valor del píxel ES el dato, no una luminancia a mirar.
  renderer.toneMapping = 0;
  renderer.render(scene, camera);

  const imagen = renderer.domElement.toDataURL("image/png");

  scene.overrideMaterial = null;
  scene.background = fondoPrevio;
  scene.fog = nieblaPrevia;
  renderer.toneMapping = toneMappingPrevio;

  return { imagen, cerca, lejos, fov: camera.fov, aspecto: camera.aspect };
}
