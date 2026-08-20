// Texturas procedurales. Cero assets externos: todo se dibuja en un canvas al
// arrancar. Resuelve el defecto que delata a un interior 3D — superficies de
// color plano sin variación de material.

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

type Ctx = CanvasRenderingContext2D;

function surface(size: number): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return { canvas, ctx: canvas.getContext("2d")! };
}

/** Repetición por eje: una superficie larga necesita más tiles en su eje largo. */
export type Repeat = number | [number, number];

function finish(canvas: HTMLCanvasElement, repeat: Repeat, color: boolean): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  const [x, y] = typeof repeat === "number" ? [repeat, repeat] : repeat;
  texture.repeat.set(x, y);
  texture.anisotropy = 8;
  if (color) texture.colorSpace = SRGBColorSpace;
  return texture;
}

const hex = (value: number) => `#${value.toString(16).padStart(6, "0")}`;

/** Veta de madera: bandas longitudinales con deriva, más poro fino. */
export function woodTexture(base: number, repeat: Repeat = 1): CanvasTexture {
  const size = 512;
  const { canvas, ctx } = surface(size);
  ctx.fillStyle = hex(base);
  ctx.fillRect(0, 0, size, size);

  for (let index = 0; index < 190; index += 1) {
    const y = Math.random() * size;
    const dark = Math.random() > 0.5;
    ctx.strokeStyle = dark
      ? `rgba(58, 42, 22, ${0.03 + Math.random() * 0.09})`
      : `rgba(255, 244, 226, ${0.02 + Math.random() * 0.07})`;
    ctx.lineWidth = 0.6 + Math.random() * 2.6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    // Tres tramos con deriva: una línea recta se lee como raya, no como veta.
    for (let x = 0; x <= size; x += size / 3) {
      ctx.lineTo(x, y + Math.sin(x * 0.012 + index) * 4 + (Math.random() - 0.5) * 3);
    }
    ctx.stroke();
  }

  for (let index = 0; index < 2600; index += 1) {
    ctx.fillStyle = `rgba(46, 34, 18, ${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  return finish(canvas, repeat, true);
}

/**
 * Duela de piso: tablas con junta y variación de tono por tabla. La veta fina
 * sola no se lee cuando el piso mide cuarenta metros — la junta sí.
 */
export function plankTexture(base: number, repeat: Repeat = 1): CanvasTexture {
  const size = 512;
  const { canvas, ctx } = surface(size);
  const planks = 6;
  const plankHeight = size / planks;

  ctx.fillStyle = hex(base);
  ctx.fillRect(0, 0, size, size);

  for (let index = 0; index < planks; index += 1) {
    const y = index * plankHeight;

    // Cada tabla se aclara u oscurece: sin esto el piso vuelve a ser un plano.
    ctx.fillStyle = `rgba(${index % 2 === 0 ? "255,246,230" : "40,28,14"}, ${0.03 + Math.random() * 0.06})`;
    ctx.fillRect(0, y, size, plankHeight);

    // Veta longitudinal dentro de la tabla.
    for (let stroke = 0; stroke < 26; stroke += 1) {
      const strokeY = y + Math.random() * plankHeight;
      ctx.strokeStyle = `rgba(46, 32, 16, ${0.04 + Math.random() * 0.1})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.7;
      ctx.beginPath();
      ctx.moveTo(0, strokeY);
      for (let x = 0; x <= size; x += size / 4) {
        ctx.lineTo(x, strokeY + (Math.random() - 0.5) * 2.4);
      }
      ctx.stroke();
    }

    // Junta entre tablas, más un filo claro que la vuelve un bisel.
    ctx.fillStyle = "rgba(28, 18, 8, 0.42)";
    ctx.fillRect(0, y, size, 1.6);
    ctx.fillStyle = "rgba(255, 248, 232, 0.13)";
    ctx.fillRect(0, y + 1.6, size, 1);

    // Cabezal: corta la tabla para que no parezca infinita.
    const seam = Math.random() * size;
    ctx.fillStyle = "rgba(28, 18, 8, 0.3)";
    ctx.fillRect(seam, y, 1.4, plankHeight);
  }

  return finish(canvas, repeat, true);
}

/** Yeso o pintura mate: nube de grano muy sutil para que el muro no sea un plano muerto. */
export function plasterTexture(base: number, repeat: Repeat = 1): CanvasTexture {
  const size = 256;
  const { canvas, ctx } = surface(size);
  ctx.fillStyle = hex(base);
  ctx.fillRect(0, 0, size, size);

  for (let index = 0; index < 9000; index += 1) {
    const tone = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${Math.random() * 0.032})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }

  return finish(canvas, repeat, true);
}

/** Tejido: trama cruzada fina para tapicería y alfombra. */
export function fabricTexture(base: number, repeat: Repeat = 1): CanvasTexture {
  const size = 256;
  const { canvas, ctx } = surface(size);
  ctx.fillStyle = hex(base);
  ctx.fillRect(0, 0, size, size);

  ctx.lineWidth = 1;
  for (let offset = 0; offset < size; offset += 3) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.018 + Math.random() * 0.016})`;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, size);
    ctx.stroke();
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.02 + Math.random() * 0.02})`;
    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(size, offset);
    ctx.stroke();
  }

  return finish(canvas, repeat, true);
}

/**
 * Mapa de rugosidad: manchas de brillo desigual. Sin esto, una superficie
 * responde a la luz de forma perfectamente uniforme y se lee como plástico.
 */
export function roughnessNoise(repeat: Repeat = 1): CanvasTexture {
  const size = 256;
  const { canvas, ctx } = surface(size);
  ctx.fillStyle = "#b4b4b4";
  ctx.fillRect(0, 0, size, size);

  for (let index = 0; index < 700; index += 1) {
    const radius = 4 + Math.random() * 26;
    const tone = 150 + Math.floor(Math.random() * 90);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(${tone}, ${tone}, ${tone}, 0.5)`);
    gradient.addColorStop(1, `rgba(${tone}, ${tone}, ${tone}, 0)`);
    ctx.save();
    ctx.translate(Math.random() * size, Math.random() * size);
    ctx.fillStyle = gradient;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();
  }

  return finish(canvas, repeat, false);
}
