import { BellRing, FileClock, FolderSearch } from "lucide-react";

const cards = [
  {
    icon: FolderSearch,
    title: "Expedientes bajo seguimiento",
    body: "El despacho registra el número exacto del expediente y la fuente judicial correspondiente. Curia usa esos datos para identificar avisos relacionados.",
  },
  {
    icon: BellRing,
    title: "Cada aviso en contexto",
    body: "La notificación puede reunir expediente, juzgado, partes, tipo de aviso, urgencia, fundamento y plazo para facilitar la revisión operativa.",
  },
  {
    icon: FileClock,
    title: "Procedencia consultable",
    body: "La fuente y el documento de origen permanecen ligados al movimiento para que el equipo pueda comprobarlo antes de actuar.",
  },
];

export default function Monitoreo() {
  return (
    <section id="monitoreo" className="bg-[var(--curia-bg)] py-16 md:py-24">
      <div className="curia-shell grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="curia-caption text-[var(--curia-primary-text)]">
            Monitoreo judicial
          </p>
          <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            Los movimientos del expediente, sin empezar la mañana desde cero.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--curia-text-secondary)] md:text-lg md:leading-8">
            Curia contrasta los expedientes registrados con los avisos obtenidos de Jalisco CJJ y concentra el resultado en el asunto correcto. El equipo revisa el movimiento con su procedencia, no como una alerta aislada.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map(({ icon: Icon, title, body }, index) => (
            <article
              key={title}
              className={`curia-card p-6 md:p-7 ${index === 2 ? "sm:col-span-2" : ""}`}
            >
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.015em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--curia-text-secondary)] md:text-base md:leading-7">
                    {body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
