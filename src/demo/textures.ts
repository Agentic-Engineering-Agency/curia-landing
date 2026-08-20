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

/**
 * Deriva un mapa de normales del propio mapa de color, tratando la luminancia
 * como altura (Sobel). Es lo que da relieve real: sin normales, la veta y la
 * trama son sólo manchas de color y la superficie sigue siendo un plano
 * perfecto ante la luz rasante.
 *
 * Se calcula una vez al arrancar. No requiere ningún asset externo.
 */
export function normalFromTexture(source: CanvasTexture, strength = 2.4): CanvasTexture {
  const src = source.image as HTMLCanvasElement;
  const size = src.width;
  const pixels = src.getContext("2d")!.getImageData(0, 0, size, size).data;

  const height = new Float32Array(size * size);
  for (let index = 0; index < height.length; index += 1) {
    const offset = index * 4;
    height[index] =
      (pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114) / 255;
  }

  // Envolvente en los bordes: la textura se repite, así que el gradiente
  // también debe cerrar o aparece una costura visible en cada tile.
  const sample = (x: number, y: number) =>
    height[((y + size) % size) * size + ((x + size) % size)];

  const { canvas, ctx } = surface(size);
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (sample(x + 1, y) - sample(x - 1, y)) * strength;
      const dy = (sample(x, y + 1) - sample(x, y - 1)) * strength;
      const length = Math.sqrt(dx * dx + dy * dy + 1);
      const offset = (y * size + x) * 4;
      image.data[offset] = ((-dx / length) * 0.5 + 0.5) * 255;
      image.data[offset + 1] = ((-dy / length) * 0.5 + 0.5) * 255;
      image.data[offset + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      image.data[offset + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  // Un mapa de normales es dato vectorial, no color: nunca lleva sRGB, y su
  // repetición tiene que coincidir con la del mapa de color o el relieve se
  // desalinea de la veta.
  return finish(canvas, [source.repeat.x, source.repeat.y], false);
}

/** Veta de madera: bandas longitudinales con deriva, más poro fino. */
export function woodTexture(base: number, repeat: Repeat = 1): CanvasTexture {
  const size = 512;
  const { canvas, ctx } = surface(size);
  ctx.fillStyle = hex(base);
  ctx.fillRect(0, 0, size, size);

  // Contraste deliberadamente alto: medido en render, con alfas por debajo de
  // 0.1 la veta desaparece a la distancia de cámara y la madera se lee como
  // color plano.
  for (let index = 0; index < 260; index += 1) {
    const y = Math.random() * size;
    const dark = Math.random() > 0.42;
    ctx.strokeStyle = dark
      ? `rgba(52, 36, 17, ${0.06 + Math.random() * 0.2})`
      : `rgba(255, 246, 230, ${0.04 + Math.random() * 0.14})`;
    ctx.lineWidth = 0.6 + Math.random() * 3.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    // Tres tramos con deriva: una línea recta se lee como raya, no como veta.
    for (let x = 0; x <= size; x += size / 3) {
      ctx.lineTo(x, y + Math.sin(x * 0.012 + index) * 4 + (Math.random() - 0.5) * 3);
    }
    ctx.stroke();
  }

  // Nudos: interrumpen la veta y evitan la lectura de material infinito. Pocos
  // y suaves: en revisión, cinco nudos marcados se leían como mugre salpicada
  // en vez de madera.
  for (let index = 0; index < 3; index += 1) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    for (let ring = 0; ring < 5; ring += 1) {
      ctx.strokeStyle = `rgba(44, 30, 14, ${0.11 - ring * 0.019})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 4 + ring * 3.6, 2 + ring * 1.7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  for (let index = 0; index < 4200; index += 1) {
    ctx.fillStyle = `rgba(46, 34, 18, ${Math.random() * 0.09})`;
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

  // Uso: rayaduras finas y polvo. Una superficie sin desgaste responde a la
  // luz de forma perfectamente uniforme, y eso es lo que delata al render.
  for (let index = 0; index < 90; index += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const length = 6 + Math.random() * 46;
    const angle = Math.random() * Math.PI;
    ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? 235 : 105}, 128, 128, ${0.1 + Math.random() * 0.22})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  for (let index = 0; index < 1800; index += 1) {
    const tone = 190 + Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${Math.random() * 0.3})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  return finish(canvas, repeat, false);
}
