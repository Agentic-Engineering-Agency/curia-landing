import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/*
 * Port de la receta `dot-field` de motion-anything (canvas 2D, sin
 * dependencias): retícula de puntos que se abomba huyendo del puntero, con
 * la fuerza modulada por la velocidad del cursor y un halo que lo sigue.
 *
 * Adaptaciones para Curia:
 * - Paleta de marca: puntos en el teal de los botones sobre blanco, halo
 *   teal en vez del oscuro del original (sobre blanco leería como mancha).
 * - Canvas fijo al viewport detrás del contenido: el costo por frame no
 *   crece con el largo del documento y sólo asoma en las secciones blancas.
 * - Puntero a nivel de ventana: el original escucha en el propio elemento,
 *   que aquí no recibe eventos por estar detrás del contenido.
 * - Sin puntero fino (táctil) o con movimiento reducido se pinta un solo
 *   cuadro y se detiene el bucle: sin cursor no hay nada que animar y el
 *   rAF sólo gastaría batería.
 */

// El radio de la receta (1.5, que dibuja 0.75 px) se calibró contra un fondo
// casi negro, donde un punto diminuto ya destaca. Medido sobre blanco: sólo
// 1.4% de píxeles con tinta y la retícula quedaba al límite de lo visible.
// Se agranda el punto en vez de subir el alfa, que los volvería duros.
const RADIO_PUNTO = 2.2;
const SEPARACION = 14;
const RADIO_CURSOR = 500;
const FUERZA_ABOMBADO = 67;
const RADIO_HALO = 160;
const DEGRADADO_DESDE = "rgba(13, 115, 119, 0.42)";
const DEGRADADO_HASTA = "rgba(10, 94, 97, 0.26)";
const COLOR_HALO = "rgba(13, 115, 119, 0.10)";
const DOS_PI = Math.PI * 2;

type Punto = { ax: number; ay: number; sx: number; sy: number };

export default function DotField() {
  const reducido = useReducedMotion();
  const lienzoRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const lienzo = lienzoRef.current;
    if (!lienzo) return;
    const ctx = lienzo.getContext("2d", { alpha: true });
    if (!ctx) return;

    const punteroFino = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const animar = punteroFino && !reducido;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let puntos: Punto[] = [];
    let ancho = 0;
    let alto = 0;

    function construir() {
      const paso = RADIO_PUNTO + SEPARACION;
      const columnas = Math.floor(ancho / paso);
      const filas = Math.floor(alto / paso);
      const margenX = (ancho % paso) / 2;
      const margenY = (alto % paso) / 2;
      puntos = [];
      for (let fila = 0; fila < filas; fila += 1) {
        for (let col = 0; col < columnas; col += 1) {
          const ax = margenX + col * paso + paso / 2;
          const ay = margenY + fila * paso + paso / 2;
          puntos.push({ ax, ay, sx: ax, sy: ay });
        }
      }
    }

    function redimensionar() {
      ancho = window.innerWidth;
      alto = window.innerHeight;
      lienzo!.width = ancho * dpr;
      lienzo!.height = alto * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      construir();
    }

    redimensionar();

    const raton = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    let interaccion = 0;
    let opacidadHalo = 0;
    let cuadro = 0;

    /** Pinta un cuadro y devuelve el desplazamiento máximo de la retícula. */
    function pintar() {
      let maxDesvio = 0;
      ctx!.clearRect(0, 0, ancho, alto);
      const degradado = ctx!.createLinearGradient(0, 0, ancho, alto);
      degradado.addColorStop(0, DEGRADADO_DESDE);
      degradado.addColorStop(1, DEGRADADO_HASTA);
      ctx!.fillStyle = degradado;

      const radio = RADIO_PUNTO / 2;
      const rcSq = RADIO_CURSOR * RADIO_CURSOR;
      ctx!.beginPath();
      for (const p of puntos) {
        const dx = raton.x - p.ax;
        const dy = raton.y - p.ay;
        const distSq = dx * dx + dy * dy;
        if (distSq < rcSq && interaccion > 0.01) {
          const dist = Math.sqrt(distSq);
          const k = 1 - dist / RADIO_CURSOR;
          const empuje = k * k * FUERZA_ABOMBADO * interaccion;
          const angulo = Math.atan2(dy, dx);
          p.sx += (p.ax - Math.cos(angulo) * empuje - p.sx) * 0.15;
          p.sy += (p.ay - Math.sin(angulo) * empuje - p.sy) * 0.15;
        } else {
          p.sx += (p.ax - p.sx) * 0.1;
          p.sy += (p.ay - p.sy) * 0.1;
        }
        const dv = Math.abs(p.sx - p.ax) + Math.abs(p.sy - p.ay);
        if (dv > maxDesvio) maxDesvio = dv;
        ctx!.moveTo(p.sx + radio, p.sy);
        ctx!.arc(p.sx, p.sy, radio, 0, DOS_PI);
      }
      ctx!.fill();

      if (opacidadHalo > 0.01) {
        const halo = ctx!.createRadialGradient(
          raton.x,
          raton.y,
          0,
          raton.x,
          raton.y,
          RADIO_HALO,
        );
        halo.addColorStop(0, COLOR_HALO);
        halo.addColorStop(1, "rgba(13, 115, 119, 0)");
        ctx!.globalAlpha = opacidadHalo;
        ctx!.fillStyle = halo;
        ctx!.fillRect(
          raton.x - RADIO_HALO,
          raton.y - RADIO_HALO,
          RADIO_HALO * 2,
          RADIO_HALO * 2,
        );
        ctx!.globalAlpha = 1;
      }
      return maxDesvio;
    }

    if (!animar) {
      pintar();
      const alRedimensionarFijo = () => {
        redimensionar();
        pintar();
      };
      let temporizador = 0;
      const rebote = () => {
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(alRedimensionarFijo, 100);
      };
      window.addEventListener("resize", rebote);
      return () => {
        window.removeEventListener("resize", rebote);
        window.clearTimeout(temporizador);
      };
    }

    const alMover = (e: PointerEvent) => {
      raton.x = e.clientX;
      raton.y = e.clientY;
      despertar();
    };
    window.addEventListener("pointermove", alMover, { passive: true });

    // La velocidad se muestrea en intervalo fijo, como el original: es lo que
    // hace que la retícula reaccione al gesto y no a la simple presencia.
    const velocimetro = window.setInterval(() => {
      const dx = raton.prevX - raton.x;
      const dy = raton.prevY - raton.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      raton.speed += (dist - raton.speed) * 0.5;
      if (raton.speed < 0.001) raton.speed = 0;
      raton.prevX = raton.x;
      raton.prevY = raton.y;
    }, 20);

    let temporizador = 0;
    const rebote = () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(redimensionar, 100);
    };
    window.addEventListener("resize", rebote);

    // El bucle sólo corre cuando hay algo que animar. Repintar un lienzo del
    // tamaño del viewport cada frame cuesta compositing aunque los 4,800
    // arcos se dibujen en 0.4 ms, y la retícula está quieta la mayor parte
    // del tiempo: al asentarse se pinta un último cuadro y se detiene, y el
    // siguiente movimiento del puntero lo vuelve a arrancar.
    const bucle = () => {
      const objetivo = Math.min(raton.speed / 5, 1);
      interaccion += (objetivo - interaccion) * 0.06;
      if (interaccion < 0.001) interaccion = 0;
      opacidadHalo += (interaccion - opacidadHalo) * 0.08;
      const desvio = pintar();
      if (interaccion === 0 && opacidadHalo <= 0.01 && desvio < 0.05) {
        cuadro = 0;
        return;
      }
      cuadro = requestAnimationFrame(bucle);
    };

    function despertar() {
      if (!cuadro) cuadro = requestAnimationFrame(bucle);
    }

    cuadro = requestAnimationFrame(bucle);

    return () => {
      cancelAnimationFrame(cuadro);
      window.clearInterval(velocimetro);
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("resize", rebote);
      window.clearTimeout(temporizador);
    };
  }, [reducido]);

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      ref={lienzoRef}
    />
  );
}
