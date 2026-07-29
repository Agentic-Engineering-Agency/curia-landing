import {
  BookOpenText,
  FileText,
  Files,
  ListChecks,
  MessagesSquare,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const documents = [
  { name: "Acuerdo de admisión", format: "PDF", status: "procesado" },
  { name: "Contestación de demanda", format: "DOCX", status: "procesando" },
  { name: "Anexo probatorio 01", format: "JPEG", status: "en cola" },
  { name: "Captura del boletín", format: "PNG", status: "subido" },
];

const cards = [
  {
    icon: Files,
    title: "Cuatro formatos de entrada",
    body: "La Biblioteca recibe PDF, DOCX, JPEG y PNG, además de los documentos obtenidos automáticamente por los flujos judiciales habilitados.",
  },
  {
    icon: BookOpenText,
    title: "Espacio propio por expediente",
    body: "Los archivos, su visualización y el estado de procesamiento permanecen ligados al caso correspondiente.",
  },
  {
    icon: ListChecks,
    title: "Fuentes elegidas por la persona abogada",
    body: "Sólo los documentos ya procesados y seleccionados de forma explícita se convierten en fuentes para el asistente del expediente.",
  },
  {
    icon: MessagesSquare,
    title: "Consulta con referencias documentales",
    body: "Curia permite resumir, preguntar y ubicar fragmentos con referencias a los archivos seleccionados. Una referencia documental no equivale por sí sola a una cita jurídica verificada.",
  },
];

const statusClass: Record<string, string> = {
  subido: "bg-[var(--curia-bg-muted)] text-[var(--curia-text-secondary)]",
  "en cola": "bg-amber-50 text-amber-800",
  procesando: "bg-sky-50 text-sky-800",
  procesado: "bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]",
};

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const MOTION_VIEWPORT = { once: true, amount: 0.15 } as const;
const FILE_PANEL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: MOTION_EASE,
    },
  },
};

export default function Biblioteca() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <section id="biblioteca" className="bg-[var(--curia-bg)] py-16 md:py-24">
      <div className="curia-shell">
        <div className="max-w-4xl">
          <p className="curia-caption text-[var(--curia-primary-text)]">
            Biblioteca por expediente
          </p>
          <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            Los documentos del asunto, listos para leer y consultar en su contexto.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--curia-text-secondary)] md:text-lg md:leading-8">
            Cada expediente cuenta con una Biblioteca para cargar y visualizar documentos. El análisis parte de los archivos del caso, no de una conversación desconectada del asunto.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <motion.div
            role="group"
            aria-label="Ejemplo de archivos en la Biblioteca del expediente"
            className="curia-card-editorial overflow-hidden lg:sticky lg:top-28"
            initial={shouldReduceMotion ? false : "hidden"}
            variants={FILE_PANEL_VARIANTS}
            viewport={MOTION_VIEWPORT}
            whileInView={shouldReduceMotion ? undefined : "visible"}
          >
            <div className="border-b border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] px-5 py-4 md:px-6">
              <h3 className="text-sm font-semibold">Archivos del expediente</h3>
              <p className="mt-1 text-xs text-[var(--curia-text-secondary)]">Expediente 123/2026</p>
            </div>
            <ul className="divide-y divide-[var(--curia-border)]">
              {documents.map((document) => (
                <li key={document.name} className="flex items-center gap-3 px-5 py-4 md:px-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--curia-border)] bg-white text-[var(--curia-primary-text)]">
                    <FileText aria-hidden="true" className="size-5" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{document.name}</p>
                    <span className="mt-1 inline-flex rounded-md border border-[var(--curia-border)] bg-white px-1.5 py-0.5 text-[0.7rem] font-bold tracking-[0.05em] text-[var(--curia-text-secondary)]">
                      {document.format}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${statusClass[document.status]}`}
                  >
                    {document.status}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map(({ icon: Icon, title, body }) => (
              <article key={title} className="curia-card p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.015em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--curia-text-secondary)]">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
