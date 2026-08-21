// Entrada de la versión en video. Escribe el DOM sólo al cambiar de capítulo.

import { CAPITULOS, crearScrub, servirPorBlob } from "./scrub";

const pista = document.querySelector<HTMLElement>("[data-pista]");
const video = document.querySelector<HTMLVideoElement>("[data-video]");
const copia = document.querySelector<HTMLElement>("[data-copia]");
const kicker = document.querySelector<HTMLElement>("[data-kicker]");
const titulo = document.querySelector<HTMLElement>("[data-titulo]");
const cuerpo = document.querySelector<HTMLElement>("[data-cuerpo]");
const contador = document.querySelector<HTMLElement>("[data-contador]");
const marcas = document.querySelector<HTMLElement>("[data-marcas]");

if (
  pista &&
  video &&
  copia &&
  kicker &&
  titulo &&
  cuerpo &&
  contador &&
  marcas
) {
  // La pista mide un viewport por sala más el margen de los tránsitos: es el
  // presupuesto de scroll, el mismo criterio que en la versión WebGL.
  pista.style.setProperty("--viewports", String(CAPITULOS.length * 2));

  const botones = CAPITULOS.map((cap, indice) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "marca";
    boton.setAttribute("aria-label", `Ir a ${cap.kicker}`);
    boton.addEventListener("click", () => scrub.irACapitulo(indice));
    marcas.append(boton);
    return boton;
  });

  function pintar(indice: number) {
    const cap = CAPITULOS[indice];
    kicker!.textContent = cap.kicker;
    titulo!.textContent = cap.titulo;
    cuerpo!.textContent = cap.cuerpo;
    contador!.textContent = `${String(indice + 1).padStart(2, "0")} / ${String(CAPITULOS.length).padStart(2, "0")}`;
    copia!.dataset.capitulo = cap.id;
    botones.forEach((b, i) => {
      b.classList.toggle("es-activa", i === indice);
      if (i === indice) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  }

  // El blob se resuelve antes de arrancar: cambiar la fuente despues reiniciaria
  // los metadatos y el driver leeria una duracion que ya no vale.
  await servirPorBlob(video);

  const scrub = crearScrub({ video, pista, alCambiarCapitulo: pintar });
  pintar(0);
  scrub.arrancar();

  // Se resuelve de inmediato si los metadatos ya llegaron: adjuntar sólo el
  // listener pierde la carrera cuando el video viene de caché.
  const marcarListo = () => {
    document.body.dataset.listo = "true";
    document.body.dataset.duracion = video.duration.toFixed(2);
  };
  if (video.readyState >= 1) marcarListo();
  else video.addEventListener("loadedmetadata", marcarListo, { once: true });
}
