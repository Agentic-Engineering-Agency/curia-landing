import { Gauge, MapPinned, UsersRound, Workflow } from "lucide-react";

const operatingModel = [
  {
    icon: UsersRound,
    title: "Visibilidad según la función",
    body: "Las personas asociadas consultan el trabajo que les corresponde; los socios pueden revisar el estado agregado del despacho.",
  },
  {
    icon: Gauge,
    title: "Capacidad con datos actuales",
    body: "La configuración muestra el uso y la capacidad vigentes del equipo, en lugar de cifras de demostración.",
  },
  {
    icon: Workflow,
    title: "Una sola cadena operativa",
    body: "Monitoreo, plazo, calendario, documentos e investigación permanecen ligados al mismo expediente.",
  },
  {
    icon: MapPinned,
    title: "Hecho para litigio mexicano",
    body: "La estructura parte de expedientes, acuerdos, boletines y plazos del entorno jurídico mexicano, no de software extranjero traducido.",
  },
];

export default function Despacho() {
  return (
    <section id="despacho" className="py-16 md:py-24">
      <div className="curia-shell grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="grid gap-4 sm:grid-cols-2">
          {operatingModel.map(({ icon: Icon, title, body }, index) => (
            <article
              key={title}
              className={`curia-card p-6 ${index === 0 || index === 3 ? "sm:translate-y-5" : ""}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgba(13,115,119,0.16)] bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="curia-caption text-[var(--curia-text-muted)]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-medium tracking-[-0.02em]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">
                {body}
              </p>
            </article>
          ))}
        </div>

        <div className="space-y-5 lg:sticky lg:top-28">
          <p className="curia-caption text-[var(--curia-primary-text)]">
            Operación del despacho
          </p>
          <h2 className="curia-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            Visibilidad para dirigir el trabajo, sin convertirla en vigilancia
            individual.
          </h2>
          <p className="text-lg leading-8 text-[var(--curia-text-secondary)]">
            Curia organiza la operación alrededor del expediente. Las personas
            asociadas trabajan sobre sus asuntos y los socios reciben agregados
            útiles de casos, plazos, asignaciones y capacidad.
          </p>
        </div>
      </div>
    </section>
  );
}
