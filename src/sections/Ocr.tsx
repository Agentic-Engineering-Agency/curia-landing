import {
  ChevronRight,
  CloudUpload,
  LockKeyhole,
  RefreshCw,
  ScanText,
} from "lucide-react";

const pipeline = [
  "Subida segura",
  "Cola",
  "OCR Gemini/Mistral",
  "Cifrado",
  "Listo para consulta",
];

const cards = [
  {
    icon: CloudUpload,
    title: "Carga separada del procesamiento",
    body: "El archivo se entrega mediante una carga preautorizada a R2 y el trabajo continúa a través de una cola de Cloudflare.",
  },
  {
    icon: ScanText,
    title: "Estado visible de principio a fin",
    body: "La interfaz distingue entre cargado, en cola, procesando, procesado y fallido para que el equipo sepa qué puede consultar.",
  },
  {
    icon: RefreshCw,
    title: "Proveedor principal y respaldo",
    body: "El OCR usa Gemini 2.5 Flash como proveedor principal y Mistral OCR como alternativa cuando el primer intento no concluye correctamente.",
  },
  {
    icon: LockKeyhole,
    title: "Resultado cifrado y fallos recuperables",
    body: "Curia permite reintentar el OCR después de un fallo y cifra el contenido procesado.",
  },
];

export default function Ocr() {
  return (
    <section
      id="ocr"
      className="border-y border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] py-16 md:py-24"
    >
      <div className="curia-shell">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-12">
          <div>
            <p className="curia-caption text-[var(--curia-primary-text)]">
              OCR asíncrono
            </p>
            <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
              Documentos que pasan de imagen a texto sin bloquear el trabajo del expediente.
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-7 text-[var(--curia-text-secondary)] md:text-lg md:leading-8 lg:pb-1">
            Curia entrega los archivos de forma segura al almacenamiento y procesa el OCR en segundo plano. El estado permanece visible, los fallos pueden reintentarse y el resultado procesado se conserva cifrado.
          </p>
        </div>

        <ol
          aria-label="Flujo de procesamiento OCR"
          className="curia-card-editorial mt-10 flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center md:flex-nowrap"
        >
          {pipeline.map((step, index) => (
            <li key={step} className="contents">
              <div className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[var(--curia-bg-subtle)] px-3 py-2 text-center text-xs font-semibold text-[var(--curia-text)] md:text-sm">
                {step}
              </div>
              {index < pipeline.length - 1 && (
                <ChevronRight
                  aria-hidden="true"
                  className="mx-auto size-4 shrink-0 rotate-90 text-[var(--curia-primary-text)] sm:rotate-0"
                  strokeWidth={2}
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {cards.map(({ icon: Icon, title, body }) => (
            <article key={title} className="curia-card flex gap-4 p-5 md:p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="font-semibold tracking-[-0.015em]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--curia-text-secondary)]">
                  {body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
