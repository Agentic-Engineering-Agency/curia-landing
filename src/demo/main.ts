// Driver de la demo: lee scroll, resuelve el modelo puro y aplica.
//
// Disciplina que se conserva al portarlo a React: el texto del DOM se escribe
// sólo cuando cambia el capítulo, nunca por frame. Lo único que cambia cada
// frame es la cámara, de forma imperativa.

import "./demo.css";
import { createDespacho } from "./despacho-scene";
import { CHAPTERS } from "./rooms";
import {
  buildTimeline,
  progressForChapter,
  resolveSequence,
  type SequenceFrame,
} from "./sequence";

const stage = document.querySelector<HTMLElement>("[data-stage]")!;
const track = document.querySelector<HTMLElement>("[data-track]")!;
const canvas = document.querySelector<HTMLCanvasElement>("[data-canvas]")!;
const css3dHost = document.querySelector<HTMLElement>("[data-css3d]")!;
const screenElement = document.querySelector<HTMLElement>("[data-screen]")!;
const kicker = document.querySelector<HTMLElement>("[data-kicker]")!;
const title = document.querySelector<HTMLElement>("[data-title]")!;
const body = document.querySelector<HTMLElement>("[data-body]")!;
const marksHost = document.querySelector<HTMLElement>("[data-marks]")!;
const counter = document.querySelector<HTMLElement>("[data-counter]")!;

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
// El tránsito debe responder al dedo, pero las paradas necesitan cerrarse con
// autoridad para leerse como pausa y no como una cámara flotando.
const TRAVEL_RESPONSE = 12;
const HOLD_RESPONSE = 20;
const HOLD_LOCK_EPSILON = 0.00035;
const timeline = buildTimeline(CHAPTERS.length);

track.style.height = `${timeline.viewportSpan * 100}vh`;

/**
 * Calidad por capacidad, no por navegador. Sin dependencias: el nombre del
 * GPU cuando el navegador lo expone, y núcleos como respaldo.
 */
function detectQuality(): "high" | "low" {
  if (matchMedia("(hover: none) and (pointer: coarse)").matches) return "low";
  const probe = document.createElement("canvas").getContext("webgl2");
  const info = probe?.getExtension("WEBGL_debug_renderer_info");
  const name = info ? String(probe!.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  if (/(intel).*(hd|uhd) graphics (4|5|6)\d{2}/i.test(name)) return "low";
  return (navigator.hardwareConcurrency ?? 4) >= 4 ? "high" : "low";
}

const despacho = createDespacho(canvas, detectQuality(), {
  element: screenElement,
  host: css3dHost,
});

// Marcas de capítulo: navegación discreta, no un carrusel.
const marks = CHAPTERS.map((chapter, index) => {
  const mark = document.createElement("button");
  mark.type = "button";
  mark.className = "mark";
  mark.innerHTML = `<span class="mark__dot"></span><span class="mark__label">${chapter.kicker}</span>`;
  mark.setAttribute("aria-label", `Ir a ${chapter.kicker}`);
  mark.addEventListener("click", () => {
    const progress = progressForChapter(timeline, index);
    const top = track.offsetTop + progress * (track.offsetHeight - innerHeight);
    scrollTo({ top, behavior: reducedMotion ? "instant" : "smooth" });
  });
  marksHost.append(mark);
  return mark;
});

const frame: SequenceFrame = {
  progress: 0,
  pathT: 0,
  chapterIndex: 0,
  segmentProgress: 0,
  holding: true,
};

let renderedChapter = -1;
let smoothedPathT = 0;
let visible = true;
let running = false;
let lastTime = 0;

function paintChapter(index: number) {
  if (index === renderedChapter) return;
  renderedChapter = index;
  const chapter = CHAPTERS[index];

  kicker.textContent = chapter.kicker;
  title.textContent = chapter.title;
  body.textContent = chapter.body;
  counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(CHAPTERS.length).padStart(2, "0")}`;

  stage.dataset.chapter = chapter.id;
  // El CSS coloca el contenido en la mitad libre del encuadre, declarada por
  // el capítulo. Así el texto nunca compite con el sujeto de la sala.
  stage.dataset.safe = chapter.safe;
  stage.style.setProperty("--accent", `#${chapter.accent.toString(16).padStart(6, "0")}`);

  marks.forEach((mark, markIndex) => {
    mark.classList.toggle("is-active", markIndex === index);
    mark.setAttribute("aria-current", markIndex === index ? "true" : "false");
  });

  if (!reducedMotion) {
    // Reinicia la animación de entrada del texto sin duplicar nodos.
    const copy = stage.querySelector<HTMLElement>("[data-copy]")!;
    copy.classList.remove("is-entering");
    void copy.offsetWidth;
    copy.classList.add("is-entering");
  }
}

function readProgress(): number {
  const span = track.offsetHeight - innerHeight;
  if (span <= 0) return 0;
  return (window.scrollY - track.offsetTop) / span;
}

function tick(time: number) {
  running = false;
  const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
  lastTime = time;

  resolveSequence(timeline, readProgress(), frame);
  paintChapter(frame.chapterIndex);

  // Amortiguación exponencial independiente del framerate. En tránsito es más
  // directa para que el dedo mande; en meseta cierra más rápido y se bloquea en
  // el punto exacto para que la sala se lea como una pausa intencionada.
  if (reducedMotion) {
    smoothedPathT = frame.pathT;
  } else {
    const response = frame.holding ? HOLD_RESPONSE : TRAVEL_RESPONSE;
    const factor = 1 - Math.exp(-delta * response);
    smoothedPathT += (frame.pathT - smoothedPathT) * factor;
    if (frame.holding && Math.abs(frame.pathT - smoothedPathT) < HOLD_LOCK_EPSILON) {
      smoothedPathT = frame.pathT;
    }
  }

  const settled = Math.abs(frame.pathT - smoothedPathT) < 0.00012;
  despacho.update(smoothedPathT, time / 1000, !reducedMotion && frame.holding && settled);
  despacho.render();

  if (!settled || (!reducedMotion && visible)) schedule();
}

function schedule() {
  if (running || !visible) return;
  running = true;
  requestAnimationFrame(tick);
}

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  despacho.resize(width, height);
  track.style.height = `${timeline.viewportSpan * 100}vh`;
  schedule();
}

new ResizeObserver(resize).observe(stage);
resize();

addEventListener("scroll", schedule, { passive: true });

// Nada corre fuera del viewport.
new IntersectionObserver(
  (entries) => {
    visible = entries[0].isIntersecting;
    if (visible) {
      lastTime = 0;
      schedule();
    }
  },
  { rootMargin: "120px" },
).observe(track);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    lastTime = 0;
    schedule();
  }
});

stage.dataset.ready = "true";
paintChapter(0);
schedule();
