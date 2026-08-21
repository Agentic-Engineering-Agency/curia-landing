import { Group, Scene, Vector3 } from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { CHAPTERS, PITCH, roomCenterZ } from "./rooms";
import type { SceneKit } from "./scene-kit";

export type WallContent = {
  /** Llamado cada frame con la posición de cámara. */
  update(cameraPosition: Vector3): void;
  dispose(): void;
};

const WALL_X = 4.36;
const PANEL_Y = 1.62;
const PANEL_Z_OFFSET = -1.9;
/**
 * A 0.001 la placa de 1600x900px medía 1.6x0.9m y en pantalla caía a 280px de
 * ancho sobre 1440: el cuerpo de texto no se leía. Subir la escala agranda la
 * placa en la sala sin retocar su diseño en píxeles, así que la jerarquía
 * tipográfica se conserva y sólo cambia cuánto ocupa en el encuadre.
 */
const CSS3D_SCALE = 0.0019;

/**
 * Las placas se giran hacia el interior en vez de quedar planas contra el muro.
 * Plano contra el muro y con la cámara avanzando en paralelo, el escorzo dejaba
 * la placa en 253px de ancho: ilegible. Girada, se lee de frente desde el
 * recorrido, que es como funciona la señalética real de un vestíbulo.
 */
const PANEL_YAW = 0.62;

/**
 * Inclinación hacia abajo de la placa, como la señalética que cuelga proud del
 * muro. Refuerza que es un objeto colgado y no un gráfico impreso en el yeso,
 * y lo hace por composición, sin coste de render.
 */
const PANEL_PITCH = 0.1;
/**
 * Ancho y alto de la placa en mundo, derivados del elemento de 1600x900px.
 * El bastidor se construye a partir de ellos para que enmarque exactamente.
 */
const PANEL_W = 1600 * CSS3D_SCALE;
const PANEL_H = 900 * CSS3D_SCALE;

/**
 * Un CSS3DObject es DOM, no geometría: no puede proyectar sombra ni recibir
 * luz, y por eso la evaluación decía que la placa se leía como un gráfico
 * pegado al muro en vez de señalética montada. El bastidor le da cuerpo real:
 * canto, material y una sombra que la separa del yeso.
 */
function buildFrame(kit: SceneKit, side: -1 | 1, z: number, accent: number): Group {
  const frame = new Group();
  const bezel = 0.075;
  const face = -side * 0.012;

  // La mancha va detrás y desbordando el bastidor: es lo que lo separa del
  // yeso. Sin ella el conjunto se lee como una calcomanía, que fue la critica
  // literal de la evaluacion.
  const cast = kit.softShadow((PANEL_W + bezel * 2) * 1.3, (PANEL_H + bezel * 2) * 1.34);
  cast.position.set(side * 0.055, -0.045, -0.055);
  frame.add(cast);
  frame.add(kit.rbox(PANEL_W + bezel * 2, PANEL_H + bezel * 2, 0.05, 0, 0, -0.03, kit.S.woodFine, true, 0.01));
  // Fondo oscuro: sin él, el HTML claro flota sobre el color de la madera.
  frame.add(kit.box(PANEL_W, PANEL_H, 0.012, 0, 0, face, kit.S.dark, false));
  // Filete de acento bajo la placa, que es lo que la ata a la sala.
  frame.add(kit.box(PANEL_W + bezel * 2, 0.022, 0.055, 0, -(PANEL_H / 2 + bezel), -0.03, { color: accent, roughness: 0.5 }, false));
  frame.position.set(side * (WALL_X - 0.06), PANEL_Y, z);
  // YXZ para que la inclinación se aplique sobre el eje ya girado: con el orden
  // por defecto el cabeceo saldría torcido respecto al muro.
  frame.rotation.order = "YXZ";
  frame.rotation.y = side === -1 ? Math.PI / 2 - PANEL_YAW : -Math.PI / 2 + PANEL_YAW;
  frame.rotation.x = PANEL_PITCH;
  return frame;
}

export function createWallContent(
  cssScene: Scene,
  panels: HTMLElement[],
  mount?: { scene: Scene; kit: SceneKit },
): WallContent {
  const mounted = panels.flatMap((panel, index) => {
    const chapter = CHAPTERS[index];
    if (!chapter) return [];

    const object = new CSS3DObject(panel);
    const side = chapter.safe === "left" ? -1 : 1;

    // Se despega del muro lo justo para que el giro no meta una esquina dentro
    // del yeso, y se orienta hacia el recorrido en vez de quedar plana.
    object.scale.setScalar(CSS3D_SCALE);
    object.position.set(side * WALL_X, PANEL_Y, roomCenterZ(index) + PANEL_Z_OFFSET);
    object.rotation.order = "YXZ";
    object.rotation.y = side === -1 ? Math.PI / 2 - PANEL_YAW : -Math.PI / 2 + PANEL_YAW;
    object.rotation.x = PANEL_PITCH;
    object.visible = false;

    // El bastidor vive en la escena WebGL y se queda visible siempre: es
    // arquitectura, y verlo desde la sala anterior es correcto. Sólo el HTML
    // debe ocultarse, porque el DOM no respeta la oclusión de los muros.
    const z = roomCenterZ(index) + PANEL_Z_OFFSET;
    if (mount) mount.scene.add(buildFrame(mount.kit, side, z, chapter.accent));

    panel.setAttribute("aria-hidden", "true");
    cssScene.add(object);

    return [{ index, panel, object }];
  });

  // Una sola fuente de verdad: la sala que ocupa la cámara. El capítulo activo
  // era un segundo estado que podía contradecirla y dejaba paneles invisibles.
  let occupiedRoom = -1;

  return {
    update(cameraPosition: Vector3) {
      const cameraRoom = Math.round(-cameraPosition.z / PITCH);
      const nextRoom = Math.min(Math.max(cameraRoom, 0), Math.max(mounted.length - 1, 0));
      if (nextRoom === occupiedRoom) return;
      occupiedRoom = nextRoom;
      mounted.forEach(({ index, panel, object }) => {
        // El DOM siempre se dibuja sobre el WebGL: una placa de otra sala se
        // vería atravesando los muros.
        const visible = index === occupiedRoom;
        object.visible = visible;
        panel.classList.toggle("is-active", visible);
        panel.setAttribute("aria-hidden", visible ? "false" : "true");
      });
    },
    dispose() {
      mounted.forEach(({ panel, object }) => {
        object.removeFromParent();
        panel.classList.remove("is-active");
        panel.setAttribute("aria-hidden", "true");
      });
      mounted.length = 0;
    },
  };
}
