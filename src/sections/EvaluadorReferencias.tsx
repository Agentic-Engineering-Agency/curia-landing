import {
  BadgeCheck,
  CircleHelp,
  CircleX,
  Clock3,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function EvaluadorReferencias() {
  return (
    <section
      id="evaluador-referencias"
      className="bg-[var(--curia-text)] py-16 text-white md:py-24"
    >
      <div className="curia-shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16">
        <div>
          <p className="curia-caption text-teal-300">Reference Evaluator</p>
          <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            La confianza de una cita debe verse antes de usarla.
          </h2>
          <p className="mt-6 text-base leading-7 text-white/72 md:text-lg md:leading-8">
            Reference Evaluator contrasta referencias jurídicas mediante caché, base autoritativa y evaluación asistida.
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

        <div className="rounded-3xl border border-white/12 bg-white/6 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
                Estados de confianza
              </p>
              <p className="mt-1 text-sm text-white/72">
                Referencias evaluadas
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
              4 estados
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <article className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/15 px-3 py-1.5 text-xs font-semibold text-amber-200">
                  <Clock3 aria-hidden="true" className="size-3.5" />
                  Pendiente
                </span>
                <span className="text-xs text-white/40">En evaluación</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/72">
                La referencia aún no cuenta con un resultado concluyente y no debe tratarse como confirmada.
              </p>
            </article>

            <article className="rounded-2xl border border-teal-300/25 bg-teal-300/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/40 bg-teal-300/15 px-3 py-1.5 text-xs font-semibold text-teal-200">
                  <BadgeCheck aria-hidden="true" className="size-3.5" />
                  Verificada
                </span>
                <a
                  href="#fuentes"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-200 underline decoration-teal-300/40 underline-offset-4 hover:text-teal-100"
                >
                  SJF · Tesis 2a./J. 45/2024
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/72">
                Existe una coincidencia en la base autoritativa y Curia puede mostrar el vínculo de la fuente correspondiente.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-300/15 bg-slate-300/7 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-300/25 bg-slate-300/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
                  <CircleHelp aria-hidden="true" className="size-3.5" />
                  Incierta
                </span>
                <span className="text-xs text-white/40">Revisión manual</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/72">
                No hay evidencia suficiente para confirmarla; Curia presenta la advertencia para que la persona abogada realice la revisión manual.
              </p>
            </article>

            <article className="rounded-2xl border border-red-300/20 bg-red-400/8 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-red-300/35 bg-red-400/15 px-3 py-1.5 text-xs font-semibold text-red-200">
                  <CircleX aria-hidden="true" className="size-3.5" />
                  Incorrecta
                </span>
                <span className="text-xs text-white/40">Inconsistencia</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/72">
                La evaluación detectó una inconsistencia y la referencia se marca de forma visible, en lugar de pasarla como confiable.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
