import { CheckCircle2, CircleDotDashed, Handshake, Landmark, Route } from "lucide-react";

const statuses = [
  {
    icon: Handshake,
    statusIcon: CircleDotDashed,
    status: "Piloto activo",
    title: "En piloto con KLGV Abogados",
    body: "KLGV Abogados participa como socio de diseño y primer cliente. Su uso en piloto guía la validación del flujo diario del despacho.",
    complete: false,
  },
  {
    icon: Landmark,
    statusIcon: CheckCircle2,
    status: "Operativo",
    title: "Jalisco CJJ operativo",
    body: "Curia puede registrar expedientes de Jalisco CJJ y relacionarlos con los avisos detectados en esa fuente judicial.",
    complete: true,
  },
  {
    icon: Route,
    statusIcon: CircleDotDashed,
    status: "En incorporación",
    title: "Más estados, en incorporación",
    body: "Las demás entidades se integran de manera progresiva. Curia comunica únicamente la cobertura que está disponible hoy.",
    complete: false,
  },
] as const;

export default function EstadoActual() {
  return (
    <section
      id="estado-actual"
      className="border-y border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] py-16 md:py-24"
    >
      <div className="curia-shell grid gap-12 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start lg:gap-20">
        <div className="lg:sticky lg:top-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(13,115,119,0.18)] bg-white/75 px-3 py-1.5 text-xs font-semibold text-[var(--curia-primary-text)] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--curia-primary)]" aria-hidden="true" />
            Piloto · julio de 2026
          </div>
          <p className="curia-caption mt-6 text-[var(--curia-primary-text)]">Curia hoy</p>
          <h2 className="curia-display mt-4 max-w-2xl text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            Un piloto real, con alcance claro.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--curia-text-secondary)]">
            Curia está en piloto con KLGV Abogados desde julio de 2026. Jalisco CJJ está operativo; los demás estados están en incorporación. El alcance se comunica tal como existe hoy.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-[var(--curia-border)] bg-white shadow-[var(--curia-shadow-sm)]">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--curia-border)] bg-white px-5 py-4 sm:px-7">
            <p className="text-sm font-semibold text-[var(--curia-text)]">Estado de incorporación</p>
            <span className="text-xs font-medium text-[var(--curia-text-muted)]">Alcance actual</span>
          </div>

          <ol className="divide-y divide-[var(--curia-border)]">
            {statuses.map((item, index) => {
              const Icon = item.icon;
              const StatusIcon = item.statusIcon;

              return (
                <li key={item.title} className="grid gap-4 px-5 py-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:px-7 sm:py-7">
                  <div className="flex items-start gap-3 sm:block">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(13,115,119,0.09)] text-[var(--curia-primary-text)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="mt-1 font-mono text-[0.65rem] font-semibold text-[var(--curia-text-muted)] sm:mt-3 sm:block">
                      0{index + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--curia-text)]">{item.title}</h3>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${
                          item.complete
                            ? "bg-[#dff4e8] text-[#276344]"
                            : "bg-[var(--curia-bg-subtle)] text-[var(--curia-primary-text)]"
                        }`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">{item.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
