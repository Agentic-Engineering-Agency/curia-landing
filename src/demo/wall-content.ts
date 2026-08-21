import { Scene, Vector3 } from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { CHAPTERS, PITCH, roomCenterZ } from "./rooms";

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

export function createWallContent(
  cssScene: Scene,
  panels: HTMLElement[],
): WallContent {
  const mounted = panels.flatMap((panel, index) => {
    const chapter = CHAPTERS[index];
    if (!chapter) return [];

    const object = new CSS3DObject(panel);
    const side = chapter.safe === "left" ? -1 : 1;

    // Se despega del muro lo justo para que el giro no meta una esquina dentro
    // del yeso, y se orienta hacia el recorrido en vez de quedar plana.
    object.scale.setScalar(CSS3D_SCALE);
    object.position.set(
      side * WALL_X,
      PANEL_Y,
      roomCenterZ(index) + PANEL_Z_OFFSET,
    );
    // A plomo sobre el muro. La referencia no gira ni inclina el contenido: el
    // texto esta impreso en el yeso y es la camara la que se pone de frente.
    object.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
    object.visible = false;

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
      const nextRoom = Math.min(
        Math.max(cameraRoom, 0),
        Math.max(mounted.length - 1, 0),
      );
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
