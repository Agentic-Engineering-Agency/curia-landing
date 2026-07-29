import {
  ArrowRight,
  CalendarCheck2,
  Clock3,
  FolderSearch,
  Gavel,
  LayoutDashboard,
  Library,
  LockKeyhole,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const highlights = [
  {
    value: "10:00",
    label: "Hora objetivo para entregar monitoreo y contexto al despacho.",
  },
  {
    value: "4 formatos",
    label: "PDF, DOCX, JPEG y PNG en la Biblioteca del expediente.",
  },
  {
    value: "4 estados",
    label: "Pendiente, verificada, incierta o incorrecta para cada referencia evaluada.",
  },
] as const;

const capabilities = [
  {
    icon: ShieldCheck,
    title: "Arquitectura de confianza",
    body: "Curia conserva la fuente y muestra el estado de las referencias evaluadas para que el equipo revise la evidencia antes de usarla.",
  },
  {
    icon: Gavel,
    title: "Diseñado para litigio mexicano",
    body: "La operación parte de expedientes, avisos, acuerdos y plazos del entorno jurídico mexicano, no de una herramienta extranjera traducida.",
  },
  {
    icon: Workflow,
    title: "Una sola cadena operativa",
    body: "Monitoreo, calendario, documentos e investigación permanecen ligados al mismo asunto para reducir la fragmentación del trabajo.",
  },
] as const;

const morningSequence = [
  {
    title: "Antes de las 10:00 — Monitoreo con contexto",
    body: "El objetivo operativo es presentar los movimientos detectados en Jalisco CJJ junto con el expediente y la fuente que corresponde.",
  },
  {
    title: "Del aviso al plazo — Revisión antes de actuar",
    body: "El acuerdo conserva su contexto mientras el equipo revisa el plazo calculado contra el documento judicial original y la legislación aplicable.",
  },
  {
    title: "Del plazo a Outlook — Evento con referencia",
    body: "Cuando Microsoft 365 está conectado y cuenta con los permisos necesarios, el equipo puede crear el evento de calendario con la referencia del expediente y su enlace de origen.",
  },
  {
    title: "Del documento a la consulta — Fuentes elegidas",
    body: "La Biblioteca procesa los documentos del expediente; sólo los archivos procesados que selecciona la persona abogada se usan como fuentes para responder.",
  },
  {
    title: "De la respuesta al escrito — Confianza visible",
    body: "Cuando una referencia pasa por Reference Evaluator, Curia muestra su estado antes de que el equipo decida usarla.",
  },
] as const;

const notices = [
  {
    file: "123/2026",
    court: "Juzgado Quinto de lo Civil",
    detail: "Acuerdo disponible para revisión",
    urgency: "Hoy",
  },
  {
    file: "084/2026",
    court: "Juzgado Segundo Mercantil",
    detail: "Nuevo movimiento detectado",
    urgency: "Revisar",
  },
  {
    file: "217/2026",
    court: "Juzgado Primero Familiar",
    detail: "Aviso relacionado con el expediente",
    urgency: "Nuevo",
  },
] as const;

function ProductVisual() {
  return (
    <div className="curia-card-editorial overflow-hidden" aria-label="Vista ilustrativa del producto Curia">
      <div className="flex items-center justify-between border-b border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d7a8a0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ddc58d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#91b7aa]" />
        </div>
        <div className="flex items-center gap-2 text-[0.68rem] font-medium text-[var(--curia-text-muted)]">
          <LockKeyhole className="h-3 w-3" aria-hidden="true" />
          Operación diaria · Vista ilustrativa
        </div>
      </div>

      <div className="grid sm:grid-cols-[7.5rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--curia-border)] bg-[#f5f3ee] p-3 sm:block" aria-label="Secciones ilustrativas">
          <div className="mb-5 flex items-center gap-2 px-2 py-1">
            <span className="curia-logo-mark !h-7 !w-7 !rounded-lg !text-sm" aria-hidden="true">
              C
            </span>
            <span className="curia-display text-lg">Curia</span>
          </div>
          <div className="space-y-1 text-[0.68rem] font-medium text-[var(--curia-text-muted)]">
            <div className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[var(--curia-primary-text)] shadow-sm">
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
              Inicio
            </div>
            <div className="flex items-center gap-2 px-2.5 py-2">
              <FolderSearch className="h-3.5 w-3.5" aria-hidden="true" />
              Expedientes
            </div>
            <div className="flex items-center gap-2 px-2.5 py-2">
              <Library className="h-3.5 w-3.5" aria-hidden="true" />
              Biblioteca
            </div>
            <div className="flex items-center gap-2 px-2.5 py-2">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Investigación
            </div>
          </div>
        </aside>

        <div className="min-w-0 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--curia-primary-text)]">Monitoreo</p>
              <p className="mt-1 text-sm font-semibold text-[var(--curia-text)]">Avisos para revisar</p>
            </div>
            <span className="rounded-full bg-[var(--curia-bg-subtle)] px-2.5 py-1 text-[0.62rem] font-semibold text-[var(--curia-text-muted)]">
              3 movimientos
            </span>
          </div>

          <div className="space-y-2.5">
            {notices.map((notice, index) => (
              <div
                key={notice.file}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5 rounded-xl border border-[var(--curia-border)] bg-white p-3 shadow-[0_2px_10px_rgba(26,32,40,0.04)]"
              >
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(13,115,119,0.09)] text-[var(--curia-primary-text)]">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-mono text-[0.7rem] font-bold text-[var(--curia-text)]">{notice.file}</span>
                    <span className="truncate text-[0.64rem] text-[var(--curia-text-muted)]">{notice.court}</span>
                  </div>
                  <p className="mt-1 text-[0.68rem] leading-4 text-[var(--curia-text-secondary)]">{notice.detail}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.06em] ${
                    index === 0
                      ? "bg-[#fff1dc] text-[#8b5208]"
                      : "bg-[var(--curia-bg-subtle)] text-[var(--curia-text-muted)]"
                  }`}
                >
                  {notice.urgency}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
            <div className="rounded-xl border border-[rgba(13,115,119,0.2)] bg-[rgba(13,115,119,0.055)] p-3">
              <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[var(--curia-primary-text)]">
                <CalendarCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                Plazo calculado
              </div>
              <p className="mt-2 font-mono text-base font-bold text-[var(--curia-text)]">17 jul 2026</p>
              <span className="mt-2 inline-flex rounded-md bg-[#dbeafe] px-2 py-1 text-[0.58rem] font-semibold text-[#27569b]">
                [Curia] Vencimiento · 123/2026
              </span>
            </div>

            <div className="rounded-xl border border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] p-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[var(--curia-text-muted)]">Referencia jurídica</p>
              <p className="mt-2 text-[0.68rem] font-medium leading-4 text-[var(--curia-text-secondary)]">
                Registro digital 0000000 · criterio ilustrativo
              </p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#dff4e8] px-2 py-1 text-[0.58rem] font-bold text-[#276344]">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Verificada · SJF
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="pointer-events-none absolute -right-28 top-12 h-96 w-96 rounded-full bg-[rgba(13,115,119,0.065)] blur-3xl" aria-hidden="true" />
      <div className="curia-shell relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(33rem,1.08fr)] lg:gap-14">
          <div>
            <p className="curia-caption text-[var(--curia-primary-text)]">Inteligencia legal para despachos mexicanos</p>
            <h1 className="curia-display mt-5 max-w-3xl text-[3.25rem] leading-[0.94] tracking-[-0.035em] text-[var(--curia-text)] sm:text-[4.1rem] lg:text-[4.9rem]">
              Inteligencia legal que trabaja mientras tú no estás.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--curia-text-secondary)]">
              Curia reúne monitoreo judicial, gestión de plazos, calendario Outlook, análisis documental e investigación jurídica con estados de confianza para las citas, todo dentro del expediente.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#contacto" className="curia-button curia-button-primary">
                Conversemos sobre tu operación
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#estado-actual" className="curia-button curia-button-secondary">
                Ver Curia hoy
              </a>
            </div>

            <dl className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.value} className="border-l-2 border-[var(--curia-primary)] pl-4">
                  <dt className="text-lg font-bold tracking-[-0.02em] text-[var(--curia-text)]">{item.value}</dt>
                  <dd className="mt-1 text-xs leading-5 text-[var(--curia-text-muted)]">{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ProductVisual />
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-28">
            <p className="curia-caption text-[var(--curia-primary-text)]">Una sola cadena operativa</p>
            <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
              Del aviso al escrito, el contexto permanece en el expediente.
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--curia-text-secondary)]">
              Curia conecta tareas que hoy suelen vivir entre boletines, hojas de cálculo, correos y chats de IA. El equipo conserva la fuente, el plazo, los documentos y la investigación en una sola cadena operativa.
            </p>
          </div>

          <div className="curia-dossier-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--curia-border)] pb-4">
              <div>
                <p className="text-sm font-semibold text-[var(--curia-text)]">Secuencia de la mañana</p>
                <p className="mt-1 text-xs text-[var(--curia-text-muted)]">Del monitoreo a una decisión revisada</p>
              </div>
              <span className="curia-status-badge">Flujo operativo</span>
            </div>
            <div className="mt-5 space-y-5">
              {morningSequence.map((item, index) => (
                <article key={item.title} className="curia-dossier-step">
                  <div className="curia-dossier-marker" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-6 text-[var(--curia-text)]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--curia-text-secondary)]">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="curia-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(13,115,119,0.1)] text-[var(--curia-primary-text)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[var(--curia-text)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
