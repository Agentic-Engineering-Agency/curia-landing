import {
  BadgeCheck,
  CircleHelp,
  CircleX,
  Clock3,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Reveal from "../components/Reveal";

export default function EvaluadorReferencias() {
  return (
    <section
      id="evaluador-referencias"
      className="scroll-mt-[4.5rem] bg-[var(--curia-text)] py-20 text-white md:py-28"
    >
      <div className="curia-shell grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16">
        <div>
          <p className="curia-caption text-teal-300">Reference Evaluator</p>
          <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            La confianza de una cita debe verse antes de usarla.
          </h2>
          <p className="mt-6 text-base leading-7 text-white/72 md:text-lg md:leading-8">
            Reference Evaluator contrasta referencias jurídicas con una base autoritativa y muestra el estado de la evaluación.
          </p>

          <div className="mt-8 flex gap-3 rounded-2xl border border-teal-300/25 bg-teal-300/8 p-5">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-teal-300"
            />
            <p className="text-sm font-medium leading-6 text-white/90">
              Sólo una coincidencia en la base autoritativa puede otorgar el estado de verificada; un modelo de IA no puede concederlo por sí solo.
            </p>
          </div>
        </div>

        <Reveal
          className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.075] p-2 shadow-2xl shadow-black/25 ring-1 ring-black/10 sm:p-3"
          delay={0.06}
          y={14}
        >
          <div className="flex items-center justify-between gap-4 rounded-t-[1.2rem] border border-white/10 bg-black/10 px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/25 bg-teal-300/10 text-teal-200">
                <ShieldCheck aria-hidden="true" className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
                  Estados de confianza
                </p>
                <p className="mt-1 text-sm text-white/80">
                  Referencias evaluadas
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/75">
              4 estados
            </span>
          </div>

          <div className="space-y-3 rounded-b-[1.2rem] border-x border-b border-white/10 bg-black/5 p-3 sm:p-4">
            <article className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/45 bg-amber-300/20 px-3 py-1.5 text-xs font-semibold text-amber-100">
                  <Clock3 aria-hidden="true" className="size-3.5" />
                  Pendiente
                </span>
                <span className="text-xs font-medium text-white/90">En evaluación</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/80">
                La referencia aún no cuenta con un resultado concluyente y no debe tratarse como confirmada.
              </p>
            </article>

            <article className="rounded-2xl border border-teal-300/30 bg-teal-300/12 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/45 bg-teal-300/20 px-3 py-1.5 text-xs font-semibold text-teal-100">
                  <BadgeCheck aria-hidden="true" className="size-3.5" />
                  Verificada
                </span>
                <a
                  href="#fuentes"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-100 underline decoration-teal-300/50 underline-offset-4 hover:text-white"
                >
                  SJF · Coincidencia en base autoritativa
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Existe una coincidencia en la base autoritativa y Curia puede mostrar el vínculo de la fuente correspondiente.
              </p>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/[0.075] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <CircleHelp aria-hidden="true" className="size-3.5" />
                  Incierta
                </span>
                <span className="text-xs text-white/60">Revisión manual</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/80">
                No hay evidencia suficiente para confirmarla; Curia presenta la advertencia para que la persona abogada realice la revisión manual.
              </p>
            </article>

            <article className="rounded-2xl border border-red-300/25 bg-red-400/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-red-300/45 bg-red-400/20 px-3 py-1.5 text-xs font-semibold text-red-100">
                  <CircleX aria-hidden="true" className="size-3.5" />
                  Incorrecta
                </span>
                <span className="text-xs font-medium text-white/90">Inconsistencia</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/80">
                La evaluación detectó una inconsistencia y la referencia se marca de forma visible, en lugar de pasarla como confiable.
              </p>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
