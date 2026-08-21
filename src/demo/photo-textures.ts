// Materiales fotográficos del despacho.
//
// Sustituyen a las texturas dibujadas en canvas para piso, muro y madera. La
// razón es la crítica de fondo del cliente: una veta procedural no resiste el
// escrutinio, porque su ritmo es regular y su respuesta a la luz uniforme. Los
// tres parches salen de los fotogramas fotorrealistas ya aprobados, así que el
// material del recorrido es el mismo que el de las imágenes que se validaron.
//
// Cada parche se hizo repetible desplazando media imagen —tras eso los bordes
// opuestos quedan contiguos en el original, así que el mosaico no tiene costura
// en el borde— y tapando la costura central resultante con una copia desplazada
// un cuarto más. Medido sobre un mosaico de 3x3: el salto en la junta baja de
// entre 28 y 88 a entre 1.2 y 4.2, contra un salto interior de 0.5 a 1.8.

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import type { Repeat } from "./textures";

/** Materiales que llegan como imagen en vez de dibujarse. */
export type FotoClave = "piso" | "muro" | "madera";

export type FotoSet = Record<FotoClave, HTMLImageElement>;

const RUTAS: Record<FotoClave, string> = {
  piso: "/textures/piso.jpg",
  muro: "/textures/muro.jpg",
  madera: "/textures/madera.jpg",
};

function cargar(url: string): Promise<HTMLImageElement> {
  const { promise, resolve, reject } = Promise.withResolvers<HTMLImageElement>();
  const img = new Image();
  img.decoding = "sync";
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`no se pudo cargar ${url}`));
  img.src = url;
  return promise;
}

/**
 * Carga los tres materiales antes de construir la escena. La escena se arma de
 * forma síncrona, así que esperar aquí es más simple que sembrar texturas
 * provisionales y refrescarlas después.
 *
 * Devuelve null si alguna falla: la escena vuelve entonces a las texturas
 * dibujadas, que siguen existiendo. Un material peor es mejor que un despacho
 * sin material.
 */
export async function cargarFotos(): Promise<FotoSet | null> {
  try {
    const [piso, muro, madera] = await Promise.all([
      cargar(RUTAS.piso),
      cargar(RUTAS.muro),
      cargar(RUTAS.madera),
    ]);
    return { piso, muro, madera };
  } catch {
    return null;
  }
}

/**
 * Pasa la imagen por un canvas en vez de usar `Texture` directamente, para que
 * el derivador de mapas de normales —que lee píxeles— siga funcionando igual
 * que con las texturas dibujadas. Un tinte opcional integra el material en la
 * paleta de la sala sin repintarlo.
 */
export function fotoTextura(img: HTMLImageElement, repeat: Repeat, tinte?: number): CanvasTexture {
  const lado = 512;
  const canvas = document.createElement("canvas");
  canvas.width = lado;
  canvas.height = lado;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, lado, lado);

  if (tinte !== undefined) {
    // `color` multiplica: conserva el detalle fotográfico y sólo desplaza el
    // tono. Un `source-over` opaco lo taparía.
    ctx.globalCompositeOperation = "color";
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = `#${tinte.toString(16).padStart(6, "0")}`;
    ctx.fillRect(0, 0, lado, lado);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace;
  textura.wrapS = RepeatWrapping;
  textura.wrapT = RepeatWrapping;
  const [rx, ry] = Array.isArray(repeat) ? repeat : [repeat, repeat];
  textura.repeat.set(rx, ry);
  // Anisotropía alta: el piso se ve en ángulo muy rasante y sin ella la duela
  // lejana se convierte en un puré gris.
  textura.anisotropy = 8;
  return textura;
}
