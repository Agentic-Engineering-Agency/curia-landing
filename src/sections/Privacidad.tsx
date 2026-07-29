import { Building2, FileLock2, KeyRound, ShieldCheck } from "lucide-react";

const privacyControls = [
  {
    icon: Building2,
    title: "Aislamiento por despacho y expediente",
    body: "Los asistentes resuelven de forma explícita a qué organización y caso pertenece cada contexto antes de usarlo.",
  },
  {
    icon: ShieldCheck,
    title: "PII sanitizada",
    body: "Curia sanitiza información personal identificable antes de llamadas externas de IA cuando la naturaleza del flujo o del documento lo requiere.",
  },
  {
    icon: KeyRound,
    title: "Cifrado con clave por cliente",
    body: "El contenido derivado del OCR usa cifrado por envolvente con una clave administrada por despacho y capacidad de destrucción criptográfica.",
  },
  {
    icon: FileLock2,
    title: "ARCO y trazabilidad",
    body: "El flujo ARCO contempla estados activo, bloqueado y eliminado; los eventos de auditoría son de sólo anexado y se conservan durante cinco años.",
  },
];

export default function Privacidad() {
  return (
    <section
      id="privacidad"
      className="border-y border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] py-16 md:py-24"
    >
      <div className="curia-shell grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start">
        <div className="space-y-5 lg:sticky lg:top-28">
          <p className="curia-caption text-[var(--curia-primary-text)]">
            Privacidad por diseño
          </p>
          <h2 className="curia-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            El expediente conserva límites técnicos, no sólo promesas.
          </h2>
          <p className="text-lg leading-8 text-[var(--curia-text-secondary)]">
            Curia reduce la exposición de información mediante aislamiento por
            despacho y caso, sanitización de datos personales, cifrado por
            cliente y flujos explícitos para derechos ARCO y trazabilidad.
          </p>
        </div>

        <div className="curia-card-editorial p-6 md:p-8">
          <ul className="divide-y divide-[var(--curia-border)]">
            {privacyControls.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="grid gap-4 py-5 first:pt-0 sm:grid-cols-[2.75rem_minmax(0,1fr)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgba(13,115,119,0.16)] bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-medium tracking-[-0.02em]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--curia-text-secondary)]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-2 rounded-[1.25rem] border border-[color:rgba(13,115,119,0.2)] bg-[var(--curia-primary-light)] p-5">
            <p className="curia-caption text-[var(--curia-primary-text)]">
              Promesa pública
            </p>
            <p className="mt-3 text-lg leading-8">
              Herramienta de apoyo: toda salida de IA requiere revisión
              profesional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
