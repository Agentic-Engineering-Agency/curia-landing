import { motion, useReducedMotion, type Variants } from "motion/react";
import { BadgeAlert, Calculator, CalendarPlus, Clock3, MapPin } from "lucide-react";
import Reveal from "../components/Reveal";

const steps = [
  {
    label: "Aviso",
    icon: Calculator,
    title: "Plazo calculado, no asumido",
    body: "Curia propone una fecha a partir del aviso y conserva el contexto usado para calcularla. La persona abogada debe cotejarla contra el documento judicial original y el código procesal aplicable.",
  },
  {
    label: "Plazo calculado",
    icon: CalendarPlus,
    title: "Crear evento en Outlook",
    body: "El evento puede incluir la referencia del expediente, la fuente, un enlace de regreso a Curia y un recordatorio previo.",
  },
  {
    label: "Evento Outlook",
    icon: BadgeAlert,
    title: "Permisos visibles",
    body: "Si falta la conexión, el alcance de permisos o el consentimiento administrativo de Microsoft 365, Curia lo señala en lugar de dar por entregado el evento.",
  },
];

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const MOTION_VIEWPORT = { once: true, amount: 0.15 } as const;
const STEP_GROUP_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};
const STEP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: MOTION_EASE,
    },
  },
};

export default function PlazosOutlook() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <section
      id="plazos-outlook"
      className="border-y border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] py-16 md:py-24"
    >
      <div className="curia-shell">
        <div className="max-w-4xl">
          <p className="curia-caption text-[var(--curia-primary-text)]">
            Plazos y Outlook
          </p>
          <h2 className="curia-display mt-4 text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            Del acuerdo a una fecha que el equipo puede revisar y calendarizar.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--curia-text-secondary)] md:text-lg md:leading-8">
            Curia convierte el movimiento judicial en contexto operativo: plazo calculado, urgencia, expediente y acceso a la fuente. Con Microsoft 365 conectado, esa información puede convertirse en un evento de Outlook.
          </p>
        </div>

        <div className="relative mt-12">
          <motion.div
            aria-hidden="true"
            className="absolute top-6 right-[16.66%] left-[16.66%] hidden h-px bg-[var(--curia-border-strong)] md:block"
            initial={shouldReduceMotion ? false : { scaleX: 0 }}
            style={{ transformOrigin: "left center" }}
            transition={{ duration: 0.42, ease: MOTION_EASE }}
            viewport={MOTION_VIEWPORT}
            whileInView={shouldReduceMotion ? undefined : { scaleX: 1 }}
          />
          <motion.ol
            className="grid gap-5 md:grid-cols-3 md:gap-6"
            initial={shouldReduceMotion ? false : "hidden"}
            variants={STEP_GROUP_VARIANTS}
            viewport={MOTION_VIEWPORT}
            whileInView={shouldReduceMotion ? undefined : "visible"}
          >
            {steps.map(({ label, icon: Icon, title, body }, index) => (
              <motion.li
                key={label}
                className="relative z-10 flex flex-col"
                variants={STEP_VARIANTS}
              >
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <span className="flex size-12 items-center justify-center rounded-full border border-[var(--curia-primary)] bg-white text-sm font-semibold text-[var(--curia-primary-text)] shadow-[var(--curia-shadow-xs)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="curia-caption text-[var(--curia-primary-text)] md:mt-1">
                    {label}
                  </span>
                </div>
                <article className="curia-card-editorial mt-4 flex-1 p-6">
                  <Icon
                    aria-hidden="true"
                    className="size-5 text-[var(--curia-primary-text)]"
                    strokeWidth={1.8}
                  />
                  <h3 className="mt-5 text-lg font-semibold tracking-[-0.015em]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--curia-text-secondary)]">
                    {body}
                  </p>
                </article>
              </motion.li>
            ))}
          </motion.ol>
        </div>

        <Reveal delay={0.21} y={10}>
          <div
            role="group"
            aria-label="Ejemplo de evento de Outlook creado por Curia"
            className="curia-card-editorial mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:ml-auto md:max-w-3xl"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1468b7] text-white">
                <CalendarPlus aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.08em] text-[var(--curia-primary-text)] uppercase">
                  Outlook
                </p>
                <p className="mt-1 truncate font-semibold">
                  [Curia] Vencimiento — Exp. 123/2026
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--curia-text-secondary)] sm:justify-end">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 aria-hidden="true" className="size-4" />
                recordatorio 24 h
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="size-4" />
                América/Ciudad de México
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
