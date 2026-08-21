// Los binarios de /media conservan nombres humanos en el repositorio, pero el
// navegador necesita una URL nueva por despliegue para poder cachearlos como
// immutable sin servir versiones viejas. Bump único cuando cambie cualquier
// video/modelo/poster; todos los consumidores pasan por esta función.
const VERSION_MEDIOS = "2026-08-21-e";

export function mediaUrl(path: string) {
  return `${path}?v=${VERSION_MEDIOS}`;
}
