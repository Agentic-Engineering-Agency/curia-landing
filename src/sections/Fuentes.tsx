import { Gavel, Landmark, LibraryBig, Newspaper } from "lucide-react";

const sources = [
  {
    code: "Jalisco CJJ",
    title: "Jalisco CJJ",
    description:
      "Fuente judicial operativa para el registro y monitoreo de expedientes del piloto. Las demás entidades están en incorporación.",
    icon: Landmark,
    status: "Operativa",
    statusClass:
      "border-teal-200 bg-teal-50 text-teal-800",
    secondaryStatus: "Demás entidades · En incorporación",
  },
  {
    code: "SJF",
    title: "Semanario Judicial de la Federación",
    description:
      "El corpus autoritativo incluye registros del SJF para contrastar referencias jurisprudenciales. Esto no implica monitoreo federal en vivo.",
    icon: Gavel,
    status: "Corpus autoritativo",
    statusClass:
      "border-sky-200 bg-sky-50 text-sky-800",
  },
  {
    code: "DOF",
    title: "Diario Oficial de la Federación",
    description:
      "DOF SIDOF funciona como fuente de referencia para publicaciones oficiales dentro del registro de Curia.",
    icon: Newspaper,
    status: "Fuente de referencia",
    statusClass:
      "border-violet-200 bg-violet-50 text-violet-800",
  },
  {
    code: "LeyesBiblio",
    title: "LeyesBiblio",
    description:
      "La Biblioteca de Leyes de la Cámara de Diputados se usa como fuente de referencia legislativa, no como fuente de avisos judiciales.",
    icon: LibraryBig,
    status: "Referencia legislativa",
    statusClass:
      "border-amber-200 bg-amber-50 text-amber-900",
  },
] as const;

export default function Fuentes() {
  return (
    <section id="fuentes" className="py-16 md:py-24">
      <div className="curia-shell">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <p className="curia-caption text-[var(--curia-primary-text)]">
              Fuentes mexicanas
            </p>
            <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
              Monitoreo judicial y contraste jurídico, sin confundir sus funciones.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[var(--curia-text-secondary)] md:text-lg md:leading-8 lg:pb-1">
            Curia distingue la fuente operativa que entrega avisos del expediente de las bases usadas para contrastar referencias. Hoy Jalisco CJJ es la fuente judicial operativa; SJF, DOF y LeyesBiblio forman parte del corpus de contraste del Reference Evaluator.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-[var(--curia-border)] bg-white shadow-[var(--curia-shadow-xs)]">
          <div
            className="hidden grid-cols-[0.72fr_1.65fr_0.7fr] gap-6 border-b border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--curia-text-secondary)] md:grid lg:px-8"
            aria-hidden="true"
          >
            <span>Registro</span>
            <span>Función</span>
            <span>Estado</span>
          </div>

          <ul
            aria-label="Fuentes judiciales y jurídicas mexicanas"
            className="divide-y divide-[var(--curia-border)]"
          >
            {sources.map((source) => {
              const Icon = source.icon;

              return (
                <li
                  key={source.code}
                  className="grid gap-5 px-5 py-6 md:grid-cols-[0.72fr_1.65fr_0.7fr] md:items-center md:gap-6 md:px-6 lg:px-8"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--curia-text-muted)] md:sr-only">
                        Registro
                      </span>
                      <span className="mt-0.5 block font-semibold tracking-[-0.01em]">
                        {source.code}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold tracking-[-0.01em]">
                      <span className="sr-only">Función: </span>
                      {source.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--curia-text-secondary)]">
                      {source.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-start">
                    <span className="sr-only">Estado: </span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${source.statusClass}`}
                    >
                      {source.status}
                    </span>
                    {"secondaryStatus" in source ? (
                      <span className="inline-flex rounded-full border border-[var(--curia-border-strong)] bg-[var(--curia-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--curia-text-secondary)]">
                        {source.secondaryStatus}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
