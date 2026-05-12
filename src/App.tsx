import { useRef } from "react";
import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  CheckCircle2,
  Files,
  Gavel,
  Landmark,
  Mail,
  MessageCircleMore,
  Phone,
  Scale,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const highlights = [
  {
    value: "32",
    label: "Sistemas judiciales fragmentados que Curia convierte en una sola rutina operativa.",
  },
  {
    value: "10:00",
    label: "Objetivo operativo para entregar monitoreo y contexto antes de que arranque el día del despacho.",
  },
  {
    value: "3 fases",
    label: "Ruta clara desde monitoreo judicial hasta investigación jurídica con citas verificadas.",
  },
] as const;

const capabilities = [
  {
    icon: Landmark,
    title: "Monitoreo judicial automático",
    body:
      "Curia revisa boletines federales y estatales, encuentra expedientes relevantes y evita que el despacho dependa de revisiones manuales cada mañana.",
  },
  {
    icon: CalendarClock,
    title: "Plazos procesales y calendario Outlook",
    body:
      "Cada notificación se convierte en una acción operativa: cálculo de plazo, contexto legal y sincronización directa con Microsoft Outlook.",
  },
  {
    icon: ShieldCheck,
    title: "Citas legales verificadas",
    body:
      "El Evaluador de Referencias contrasta artículos, tesis y publicaciones oficiales contra LeyesBiblio, SJF y DOF antes de pedirte confianza.",
  },
  {
    icon: Files,
    title: "Análisis documental con IA",
    body:
      "Sentencias, contratos y acuerdos dejan de ser semanas de lectura. Curia extrae estructura, resume y permite conversar con el documento.",
  },
  {
    icon: MessageCircleMore,
    title: "Asistente en Telegram",
    body:
      "Alertas, consultas rápidas y seguimiento desde el canal donde los litigantes ya trabajan, con enlaces profundos al caso correcto.",
  },
  {
    icon: Workflow,
    title: "Visibilidad para socios sin vigilancia",
    body:
      "Capacidad del equipo, cumplimiento y carga por despacho; agregados útiles para dirigir operación sin convertir la plataforma en un sistema de supervisión invasiva.",
  },
] as const;

const differentiators = [
  {
    title: "Arquitectura de confianza",
    body:
      "Curia no te pide fe en una respuesta de IA. Te muestra la fuente, la fecha y el estado de verificación de cada cita antes de que llegue a un escrito.",
  },
  {
    title: "Diseñado para litigio mexicano",
    body:
      "No es software importado adaptado con traducción. La estructura, terminología y prioridades parten de boletines, expedientes, acuerdos y plazos reales del entorno mexicano.",
  },
  {
    title: "Una sola cadena operativa",
    body:
      "Monitoreo judicial, calendario, documentos, investigación y coordinación viven sobre el mismo caso. Menos fragmentación, menos omisiones, más control.",
  },
] as const;

const phases = [
  {
    name: "Fase 1 — Fundación y monitoreo",
    dates: "Abril → mayo 2026",
    body:
      "Infraestructura, autenticación, monitoreo judicial federal y Jalisco, registro de casos, asignación de tareas y sincronización con Outlook.",
  },
  {
    name: "Fase 2 — Núcleo de inteligencia legal",
    dates: "Mayo → junio 2026",
    body:
      "OCR y análisis documental, chat con documentos, verificación anti-alucinación y asistente de Telegram para el trabajo diario.",
  },
  {
    name: "Fase 3 — Profundidad y robustez",
    dates: "Junio → julio 2026",
    body:
      "Investigación jurídica jerárquica, OneDrive, procesamiento de notas y endurecimiento para producción antes del lanzamiento.",
  },
] as const;

const trustPoints = [
  "Privacidad por diseño: asociados ven sus asuntos; socios reciben visibilidad agregada.",
  "PII sanitizada antes de cualquier llamada a IA externa cuando la naturaleza del documento lo exige.",
  "Rastro auditable y trazabilidad de decisiones de IA para un entorno regulado.",
] as const;

export default function App() {
  const formRef = useRef<HTMLFormElement>(null);

  const buildMailtoHref = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const firm = String(data.get("firm") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subjectContext = firm || name || "Nuevo contacto";
    const subject = `Consulta sobre Curia — ${subjectContext}`;
    const body = [
      `Nombre: ${name || "No especificado"}`,
      `Despacho: ${firm || "No especificado"}`,
      `Correo: ${email || "No especificado"}`,
      "",
      "Mensaje:",
      message || "Hola, me interesa conocer más sobre Curia.",
    ].join("\n");

    return `mailto:info@agenticengineering.agency?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const prepareInquiryLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const form = formRef.current;
    if (!form) {
      event.preventDefault();
      return;
    }

    const requiredFields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]"));
    const firstMissing = requiredFields.find((field) => field.value.trim().length === 0);
    if (firstMissing) {
      event.preventDefault();
      firstMissing.focus();
      return;
    }

    event.currentTarget.href = buildMailtoHref(form);
  };

  return (
    <div className="min-h-screen bg-[var(--curia-bg)] text-[var(--curia-text)]">
      <div className="curia-grid-halo" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-[var(--curia-border)] bg-[color:rgba(255,255,255,0.88)] backdrop-blur-xl">
        <div className="curia-shell flex h-18 items-center justify-between gap-6">
          <a href="#inicio" className="flex items-center gap-3">
            <span className="curia-logo-mark">C</span>
            <span className="flex items-end gap-0.5 text-[1.55rem] leading-none tracking-[-0.03em]">
              <span className="font-serif italic">Curia</span>
              <span className="text-[var(--curia-primary)]">.</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-[var(--curia-text-secondary)] md:flex">
            <a className="transition-colors hover:text-[var(--curia-text)]" href="#producto">
              Producto
            </a>
            <a className="transition-colors hover:text-[var(--curia-text)]" href="#capacidades">
              Capacidades
            </a>
            <a className="transition-colors hover:text-[var(--curia-text)]" href="#fases">
              Plan 2026
            </a>
            <a className="transition-colors hover:text-[var(--curia-text)]" href="#contacto">
              Contacto
            </a>
          </nav>

          <a className="curia-button curia-button-primary hidden md:inline-flex" href="#contacto">
            Solicitar una conversación
          </a>
        </div>
      </header>

      <main id="inicio">
        <section className="curia-shell relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-end">
            <div className="space-y-7 curia-fade-up">
              <div className="space-y-4">
                <p className="curia-caption text-[var(--curia-primary-text)]">Inteligencia legal para despachos mexicanos</p>
                <h1 className="curia-display max-w-4xl text-[3rem] leading-[0.95] tracking-[-0.04em] md:text-[4.8rem]">
                  La primera impresión pública de un despacho no debería depender del caos judicial.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[var(--curia-text-secondary)] md:text-xl">
                  Curia transforma boletines, plazos, documentos y citas legales en una sola capa de
                  trabajo confiable para litigantes y socios. Monitoreo judicial, calendario,
                  análisis documental y verificación jurídica con el estándar que exige un despacho
                  mexicano serio.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a className="curia-button curia-button-primary" href="#contacto">
                  Conocer Curia
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a className="curia-button curia-button-secondary" href="#fases">
                  Ver plan de lanzamiento
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map((item) => (
                  <article key={item.value} className="curia-stat-card">
                    <p className="curia-display text-[2rem] leading-none md:text-[2.4rem]">{item.value}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--curia-text-secondary)]">{item.label}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="curia-fade-up space-y-4" style={{ animationDelay: "120ms" }}>
              <div className="curia-card-editorial p-6 md:p-7">
                <p className="curia-caption">Idea central</p>
                <p className="mt-4 text-2xl leading-tight tracking-[-0.02em] text-[var(--curia-text)] md:text-[2rem]">
                  <span className="curia-display-italic">Inteligencia legal que trabaja mientras tú no estás.</span>
                </p>
                <div className="mt-6 space-y-4 border-t border-[var(--curia-border)] pt-5 text-sm leading-6 text-[var(--curia-text-secondary)]">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--curia-primary)]" aria-hidden="true" />
                    <p>Socio de diseño confirmado: KLGV Abogados, Guadalajara.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Scale className="mt-0.5 h-4 w-4 text-[var(--curia-primary)]" aria-hidden="true" />
                    <p>Verificación de citas contra fuentes oficiales antes de pedir confianza.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-[var(--curia-primary)]" aria-hidden="true" />
                    <p>Lanzamiento objetivo: 16 de julio de 2026.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <article className="curia-card p-5">
                  <p className="curia-caption">Lo que desaparece</p>
                  <p className="mt-3 text-lg leading-7">La revisión manual de listas, el cálculo artesanal de plazos y la IA que cita artículos inexistentes.</p>
                </article>
                <article className="curia-card p-5">
                  <p className="curia-caption">Lo que aparece</p>
                  <p className="mt-3 text-lg leading-7">Un tablero confiable, calendario accionable y contexto jurídico verificable desde el primer toque.</p>
                </article>
              </div>
            </aside>
          </div>
        </section>

        <section id="producto" className="border-y border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] py-16 md:py-24">
          <div className="curia-shell grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div className="space-y-5">
              <p className="curia-caption text-[var(--curia-primary-text)]">El problema</p>
              <h2 className="curia-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
                El litigio mexicano castiga los descuidos silenciosos.
              </h2>
              <p className="text-lg leading-8 text-[var(--curia-text-secondary)]">
                Cada mañana, un despacho revisa sistemas judiciales fragmentados, interpreta acuerdos,
                calcula plazos y después salta a Outlook, Excel, chats y herramientas genéricas de IA.
                Curia existe para devolver orden, trazabilidad y criterio a esa cadena.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="curia-card p-6">
                <Landmark className="h-5 w-5 text-[var(--curia-primary)]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-medium tracking-[-0.02em]">Sistemas judiciales sin una sola puerta de entrada</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">
                  México publica notificaciones en ecosistemas distintos. Perder una publicación no es una incomodidad: es un riesgo de mala práctica.
                </p>
              </article>
              <article className="curia-card p-6">
                <Gavel className="h-5 w-5 text-[var(--curia-primary)]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-medium tracking-[-0.02em]">Citas legales alucinadas son responsabilidad profesional</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">
                  Curia no confunde velocidad con rigor: una respuesta útil sin verificación documental no alcanza el estándar del despacho.
                </p>
              </article>
              <article className="curia-card p-6 md:col-span-2">
                <BookOpenText className="h-5 w-5 text-[var(--curia-primary)]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-medium tracking-[-0.02em]">La solución es un flujo único: monitoreo → calendario → acción → investigación</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">
                  Curia centraliza la rutina diaria del litigante: detecta el acuerdo, calcula el plazo, lo sincroniza al calendario, abre el caso correcto y deja lista la capa de análisis documental e investigación jurídica.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="capacidades" className="curia-shell py-16 md:py-24">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="curia-caption text-[var(--curia-primary-text)]">Capacidades clave</p>
              <h2 className="curia-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
                Un frente público que promete menos, pero cumple con más rigor.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[var(--curia-text-secondary)]">
              La propuesta no es automatizar por moda. Es dar a los abogados una infraestructura de confianza sobre la que sí se puede trabajar todos los días.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, body }, index) => (
              <article
                key={title}
                className="curia-card-editorial p-6 curia-fade-up"
                style={{ animationDelay: `${String(index * 60)}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgba(13,115,119,0.15)] bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-medium tracking-[-0.02em]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[var(--curia-text)] py-16 text-white md:py-24">
          <div className="curia-shell grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div className="space-y-5">
              <p className="curia-caption text-white/70">Por qué Curia se siente distinta</p>
              <h2 className="curia-display text-[2.5rem] leading-[0.98] tracking-[-0.03em] text-white md:text-[3.6rem]">
                La confianza no es un claim. Es una arquitectura.
              </h2>
              <p className="text-lg leading-8 text-white/72">
                La diferencia no está en tener más funciones en un folleto. Está en unir monitoreo,
                operación y razonamiento jurídico con controles visibles para quien carga el riesgo profesional.
              </p>
            </div>

            <div className="grid gap-4">
              {differentiators.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-sm">
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="fases" className="curia-shell py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div className="space-y-5">
              <p className="curia-caption text-[var(--curia-primary-text)]">Plan 2026</p>
              <h2 className="curia-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
                Un despliegue por fases, con criterio de producto y fecha clara de salida.
              </h2>
              <p className="text-lg leading-8 text-[var(--curia-text-secondary)]">
                Curia no pretende prometerlo todo en un solo salto. Cada fase libera valor operativo real y prepara la siguiente capa de inteligencia.
              </p>
            </div>

            <div className="space-y-4">
              {phases.map((phase, index) => (
                <article key={phase.name} className="curia-phase-card">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--curia-primary-light)] text-sm font-semibold text-[var(--curia-primary-text)]">
                      0{index + 1}
                    </div>
                    <div>
                      <p className="curia-caption text-[var(--curia-text-muted)]">{phase.dates}</p>
                      <h3 className="mt-2 text-xl font-medium tracking-[-0.02em]">{phase.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">{phase.body}</p>
                    </div>
                  </div>
                </article>
              ))}

              <article className="rounded-[1.5rem] border border-[color:rgba(13,115,119,0.18)] bg-[linear-gradient(180deg,rgba(13,115,119,0.08),rgba(13,115,119,0.02))] p-6">
                <p className="curia-caption text-[var(--curia-primary-text)]">Hito comprometido</p>
                <p className="mt-3 text-2xl tracking-[-0.03em] md:text-[2rem]">
                  Lanzamiento en producción el <span className="font-medium text-[var(--curia-primary-text)]">16 de julio de 2026</span>.
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--curia-text-secondary)]">
                  KLGV Abogados participa como socio de diseño y primer cliente. La hoja de ruta pública parte de necesidades reales, no de abstracciones de laboratorio.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] py-16 md:py-24">
          <div className="curia-shell grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div className="space-y-5">
              <p className="curia-caption text-[var(--curia-primary-text)]">Confianza, cumplimiento y criterio</p>
              <h2 className="curia-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.6rem]">
                Curia está pensada para una realidad regulada, no para una demo vacía.
              </h2>
              <p className="text-lg leading-8 text-[var(--curia-text-secondary)]">
                Despachos legales trabajan con información sensible, trazabilidad y consecuencias. Por eso la experiencia pública también debe mostrar que el producto fue concebido con disciplina operativa.
              </p>
            </div>

            <div className="curia-card-editorial p-6 md:p-8">
              <ul className="space-y-4">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm leading-7 text-[var(--curia-text-secondary)]">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--curia-primary)]" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-[1.25rem] border border-[var(--curia-border)] bg-white/75 p-5">
                <p className="curia-caption">Promesa pública</p>
                <p className="mt-3 text-lg leading-8">
                  Curia no reemplaza el juicio profesional. Lo refuerza con monitoreo, contexto y verificación donde hoy hay dispersión y riesgo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="curia-shell py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="curia-caption text-[var(--curia-primary-text)]">Contacto</p>
                <h2 className="curia-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.6rem]">
                  Si tu despacho quiere dejar atrás la revisión manual, conversemos.
                </h2>
                <p className="text-lg leading-8 text-[var(--curia-text-secondary)]">
                  Cuéntanos cómo monitorean hoy sus expedientes, qué tan distribuido está el equipo y qué esperan de una plataforma legal confiable. Abriremos tu servicio de correo con el mensaje listo para enviarse.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <a className="curia-contact-card" href="tel:+523322412595">
                  <Phone className="h-5 w-5 text-[var(--curia-primary)]" aria-hidden="true" />
                  <div>
                    <p className="curia-caption">Teléfono</p>
                    <p className="mt-2 text-lg tracking-[-0.02em]">+52 33 2241 2595</p>
                  </div>
                </a>
                <a className="curia-contact-card" href="mailto:info@agenticengineering.agency">
                  <Mail className="h-5 w-5 text-[var(--curia-primary)]" aria-hidden="true" />
                  <div>
                    <p className="curia-caption">Correo</p>
                    <p className="mt-2 text-lg tracking-[-0.02em]">info@agenticengineering.agency</p>
                  </div>
                </a>
              </div>
            </div>

            <form ref={formRef} className="curia-card-editorial p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="curia-field">
                  <span>Nombre</span>
                  <input required name="name" autoComplete="name" placeholder="Tu nombre" />
                </label>
                <label className="curia-field">
                  <span>Despacho</span>
                  <input name="firm" placeholder="Nombre del despacho" />
                </label>
              </div>

              <label className="curia-field mt-4">
                <span>Correo de contacto</span>
                <input required name="email" type="email" autoComplete="email" placeholder="tu@despacho.com" />
              </label>

              <label className="curia-field mt-4">
                <span>¿Qué te gustaría explorar con Curia?</span>
                <textarea
                  required
                  name="message"
                  rows={6}
                  placeholder="Cuéntanos qué tipo de casos monitorean, cómo coordinan plazos o qué problema quieren resolver primero."
                />
              </label>

              <div className="mt-6 flex flex-col gap-3 border-t border-[var(--curia-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm leading-6 text-[var(--curia-text-secondary)]">
                  Al enviar, abriremos tu cliente de correo con un mensaje dirigido a Agentic Engineering para que puedas continuar la conversación de inmediato.
                </p>
                <a
                  className="curia-button curia-button-primary"
                  href="mailto:info@agenticengineering.agency"
                  onClick={prepareInquiryLink}
                >
                  Redactar correo de interés
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] py-8">
        <div className="curia-shell flex flex-col gap-3 text-sm text-[var(--curia-text-secondary)] md:flex-row md:items-center md:justify-between">
          <p>Curia — inteligencia legal para despachos mexicanos.</p>
          <p>Diseñado por Agentic Engineering con KLGV Abogados como socio de diseño.</p>
        </div>
      </footer>
    </div>
  );
}
