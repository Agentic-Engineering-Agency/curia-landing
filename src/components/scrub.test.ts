import { describe, expect, it } from "vitest";
import { CAPITULOS, capituloDe, ritmo, tiempoPara } from "./scrub";

describe("ritmo del recorrido", () => {
  it("clava los extremos", () => {
    expect(ritmo(0)).toBe(0);
    expect(ritmo(1)).toBe(1);
  });

  it("satura fuera de rango en vez de extrapolar", () => {
    expect(ritmo(-3)).toBe(0);
    expect(ritmo(4)).toBe(1);
  });

  it("crece de forma monótona: el scroll nunca retrocede el video", () => {
    let previo = -1;
    for (let i = 0; i <= 200; i += 1) {
      const valor = ritmo(i / 200);
      expect(valor).toBeGreaterThanOrEqual(previo);
      previo = valor;
    }
  });

  it("arranca y frena: los extremos avanzan menos que el centro", () => {
    const entrada = ritmo(0.1) - ritmo(0);
    const centro = ritmo(0.55) - ritmo(0.45);
    const salida = ritmo(1) - ritmo(0.9);
    expect(centro).toBeGreaterThan(entrada * 3);
    expect(centro).toBeGreaterThan(salida * 3);
  });
});

describe("tiempo de video", () => {
  it("deja margen en la cola para que el cuadro final se pinte", () => {
    const d = 19.6;
    expect(tiempoPara(1, d)).toBeCloseTo(d - 0.05, 5);
    expect(tiempoPara(1, d)).toBeLessThan(d);
  });

  it("empieza en cero", () => {
    expect(tiempoPara(0, 19.6)).toBe(0);
  });

  it("no divide por una duración ausente", () => {
    expect(tiempoPara(0.5, 0)).toBe(0);
  });

  it("nunca sale del clip", () => {
    for (let i = 0; i <= 100; i += 1) {
      const t = tiempoPara(i / 100, 12);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(12);
    }
  });
});

describe("capítulo activo", () => {
  it("resuelve cada marca a su propio capítulo", () => {
    CAPITULOS.forEach((cap, indice) => {
      expect(capituloDe(cap.marca)).toBe(indice);
    });
  });

  it("cubre todo el recorrido sin huecos", () => {
    const vistos = new Set<number>();
    for (let i = 0; i <= 500; i += 1) {
      const indice = capituloDe(i / 500);
      expect(indice).toBeGreaterThanOrEqual(0);
      expect(indice).toBeLessThan(CAPITULOS.length);
      vistos.add(indice);
    }
    expect(vistos.size).toBe(CAPITULOS.length);
  });

  it("avanza sin retroceder al avanzar el recorrido", () => {
    let previo = 0;
    for (let i = 0; i <= 500; i += 1) {
      const indice = capituloDe(i / 500);
      expect(indice).toBeGreaterThanOrEqual(previo);
      previo = indice;
    }
  });

  it("las marcas están ordenadas y dentro del rango", () => {
    CAPITULOS.forEach((cap, i) => {
      expect(cap.marca).toBeGreaterThan(0);
      expect(cap.marca).toBeLessThan(1);
      if (i > 0) expect(cap.marca).toBeGreaterThan(CAPITULOS[i - 1].marca);
    });
  });
});
