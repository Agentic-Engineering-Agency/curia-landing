import {
  BriefcaseBusiness,
  FileText,
  PanelTopOpen,
  Scale,
  TriangleAlert,
} from "lucide-react";

export default function Asistentes() {
  return (
    <section id="asistentes" className="py-16 md:py-24">
      <div className="curia-shell">
        <div className="max-w-4xl">
          <p className="curia-caption text-[var(--curia-primary-text)]">
            Asistentes con contexto
          </p>
          <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            Una superficie de ayuda para cada momento, con límites explícitos.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--curia-text-secondary)] md:text-lg md:leading-8">
            Curia ofrece asistencia dentro del expediente, una vista general y un copiloto del sitio. Cada modalidad resuelve el contexto de forma explícita, respeta el aislamiento entre despachos y casos, y sigue un contrato de no fabricación.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="curia-card-editorial overflow-hidden p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                <BriefcaseBusiness aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.01em]">
                  Agente del expediente
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--curia-text-secondary)]">
                  Trabaja dentro del caso y responde a partir del contexto y de los documentos procesados que la persona abogada selecciona.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] p-4 md:p-5">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--curia-border)] pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--curia-text-secondary)]">
                  <FileText aria-hidden="true" className="size-4 text-[var(--curia-primary-text)]" />
                  Documento seleccionado
                </div>
                <span className="text-xs text-[var(--curia-text-muted)]">
                  Acuerdo judicial
                </span>
              </div>

              <div className="mt-4 space-y-3" aria-label="Ejemplo de consulta al agente del expediente">
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[var(--curia-primary-deep)] px-4 py-3 text-sm leading-6 text-white">
                  ¿Qué establece el acuerdo sobre el plazo?
                </div>
                <div className="max-w-[94%] rounded-2xl rounded-bl-md border border-[var(--curia-border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--curia-text-secondary)]">
                  <p>
                    El acuerdo establece el plazo descrito en el documento seleccionado.
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 font-medium text-[var(--curia-primary-text)]">
                    <FileText aria-hidden="true" className="size-3.5" />
                    Acuerdo judicial · pág. 3
                  </p>
                  <p className="mt-3 border-t border-[var(--curia-border)] pt-3 text-xs leading-5 text-[var(--curia-text-muted)]">
                    Toda salida de IA requiere revisión profesional contra el documento original y la legislación aplicable.
                  </p>
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-5">
            <article className="curia-card p-6 md:p-7">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                <Scale aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">
                Asistente general
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--curia-text-secondary)]">
                Atiende consultas jurídicas y ayuda a preparar texto copiable sin perder de vista el estado de confianza de las referencias.
              </p>
            </article>

            <article className="curia-card p-6 md:p-7">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                <PanelTopOpen aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">
                Copiloto del sitio
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--curia-text-secondary)]">
                Acompaña la navegación y usa el contexto disponible de manera controlada, sin mezclar información entre despachos o expedientes.
              </p>
            </article>
          </div>
        </div>

        <aside className="mt-5 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-start md:p-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <TriangleAlert aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-amber-950">
              Revisión profesional obligatoria
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-amber-950/75">
              Curia es una herramienta de apoyo y no sustituye el análisis ni la asesoría profesional. Toda salida de IA, cita y cálculo de plazo debe revisarse contra el documento original y la legislación aplicable; la IA no consulta por sí sola internet ni legislación vigente en tiempo real.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
