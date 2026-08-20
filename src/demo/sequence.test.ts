import { describe, expect, it } from "vitest";
import {
  buildTimeline,
  progressForChapter,
  resolveSequence,
  type SequenceFrame,
} from "./sequence";

describe("buildTimeline", () => {
  it("alterna meseta y tránsito y cubre el rango completo sin huecos", () => {
    const timeline = buildTimeline(5);
    // 5 mesetas + 4 tránsitos.
    expect(timeline.segments).toHaveLength(9);
    expect(timeline.segments.map((s) => s.kind)).toEqual([
      "hold",
      "travel",
      "hold",
      "travel",
      "hold",
      "travel",
      "hold",
      "travel",
      "hold",
    ]);

    expect(timeline.segments[0].start).toBe(0);
    expect(timeline.segments.at(-1)!.end).toBe(1);
    for (let i = 1; i < timeline.segments.length; i += 1) {
      expect(timeline.segments[i].start).toBeCloseTo(timeline.segments[i - 1].end, 12);
    }
  });

  it("ancla la primera parada al inicio de la curva y la última al final", () => {
    const timeline = buildTimeline(5);
    expect(timeline.segments[0].fromT).toBe(0);
    expect(timeline.segments.at(-1)!.toT).toBe(1);
  });

  it("rechaza secuencias que no pueden viajar", () => {
    expect(() => buildTimeline(1)).toThrow();
  });
});

describe("resolveSequence", () => {
  const timeline = buildTimeline(5);

  it("mantiene la cámara inmóvil durante una meseta", () => {
    const hold = timeline.segments[0];
    const a = resolveSequence(timeline, hold.start + 0.001).pathT;
    const b = resolveSequence(timeline, hold.end - 0.001).pathT;
    expect(a).toBe(b);
    expect(a).toBe(0);
  });

  it("avanza de forma monótona sobre la curva en todo el recorrido", () => {
    let previous = -1;
    for (let i = 0; i <= 400; i += 1) {
      const { pathT } = resolveSequence(timeline, i / 400);
      expect(pathT).toBeGreaterThanOrEqual(previous);
      expect(pathT).toBeGreaterThanOrEqual(0);
      expect(pathT).toBeLessThanOrEqual(1);
      previous = pathT;
    }
  });

  it("llega a los extremos exactos de la curva", () => {
    expect(resolveSequence(timeline, 0).pathT).toBe(0);
    expect(resolveSequence(timeline, 1).pathT).toBe(1);
  });

  it("satura fuera de rango en vez de extrapolar", () => {
    expect(resolveSequence(timeline, -3).pathT).toBe(0);
    expect(resolveSequence(timeline, 7).pathT).toBe(1);
    expect(resolveSequence(timeline, -3).progress).toBe(0);
    expect(resolveSequence(timeline, 7).progress).toBe(1);
  });

  it("reporta el capítulo del que sale mientras viaja", () => {
    const travel = timeline.segments[1];
    const frame = resolveSequence(timeline, (travel.start + travel.end) / 2);
    expect(frame.holding).toBe(false);
    expect(frame.chapterIndex).toBe(0);
    expect(frame.pathT).toBeGreaterThan(0);
    expect(frame.pathT).toBeLessThan(0.25);
  });

  it("reutiliza el objeto destino sin asignar uno nuevo", () => {
    const target = {} as SequenceFrame;
    const first = resolveSequence(timeline, 0.3, target);
    const second = resolveSequence(timeline, 0.7, target);
    expect(first).toBe(target);
    expect(second).toBe(target);
  });
});

describe("progressForChapter", () => {
  const timeline = buildTimeline(5);

  it("deja la cámara detenida en la parada del capítulo pedido", () => {
    for (let chapter = 0; chapter < 5; chapter += 1) {
      const frame = resolveSequence(timeline, progressForChapter(timeline, chapter));
      expect(frame.chapterIndex).toBe(chapter);
      expect(frame.holding).toBe(true);
      expect(frame.pathT).toBeCloseTo(chapter / 4, 12);
    }
  });
});
