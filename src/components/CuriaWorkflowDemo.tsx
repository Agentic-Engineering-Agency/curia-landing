import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CalendarCheck2,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  Pause,
  Play,
  RotateCcw,
  ScanText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import {
  DEFAULT_CURIA_DEMO_SCENARIO,
  type CuriaDemoEvidenceTone,
  type CuriaDemoScenario,
  type CuriaDemoStepKind,
} from "../data/curia-demo";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export interface CuriaWorkflowDemoProps {
  readonly scenario?: CuriaDemoScenario;
  readonly dataSource?: "local" | "remote";
}

const STEP_ICONS: Record<CuriaDemoStepKind, LucideIcon> = {
  movement: BellRing,
  deadline: ShieldCheck,
  calendar: CalendarCheck2,
  library: ScanText,
  references: FileCheck2,
};

const EVIDENCE_ICONS: Record<CuriaDemoEvidenceTone, LucideIcon> = {
  source: FileCheck2,
  attention: CircleAlert,
  ready: CheckCircle2,
  verified: ShieldCheck,
};

const AUTO_STEP_DELAY_MS = 3_800;

function boundedIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, length - 1));
}

export default function CuriaWorkflowDemo({
  scenario = DEFAULT_CURIA_DEMO_SCENARIO,
  dataSource = "local",
}: CuriaWorkflowDemoProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [automaticRequested, setAutomaticRequested] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const demoRef = useRef<HTMLElement>(null);
  const idPrefix = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  const automatic = automaticRequested && !prefersReducedMotion;
  const steps =
    scenario.steps.length > 0
      ? scenario.steps
      : DEFAULT_CURIA_DEMO_SCENARIO.steps;
  const safeIndex = boundedIndex(activeIndex, steps.length);
  const activeStep = steps[safeIndex];
  const ActiveIcon = STEP_ICONS[activeStep.kind];
  const EvidenceIcon = EVIDENCE_ICONS[activeStep.evidence.tone];
  const isLastStep = safeIndex === steps.length - 1;

  useEffect(() => {
    const element = demoRef.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () =>
      setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!automatic || !isVisible || !pageVisible) return;
    const timeout = window.setTimeout(() => {
      setActiveIndex(
        (index) => (boundedIndex(index, steps.length) + 1) % steps.length,
      );
    }, AUTO_STEP_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [automatic, isVisible, pageVisible, safeIndex, steps.length]);

  function selectManually(index: number) {
    setAutomaticRequested(false);
    setActiveIndex(boundedIndex(index, steps.length));
  }

  function selectFromKeyboard(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % steps.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + steps.length) % steps.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = steps.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    selectManually(nextIndex);
    const tabs =
      event.currentTarget.parentElement?.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );
    tabs?.[nextIndex]?.focus();
  }

  return (
    <article
      ref={demoRef}
      className="curia-demo"
      data-demo-source={dataSource}
      data-demo-step={activeStep.id}
      data-demo-mode={automatic ? "automatic" : "manual"}
      aria-labelledby={`${idPrefix}-title`}
    >
      <header className="curia-demo-header">
        <div>
          <p className="curia-caption text-[var(--curia-primary-text)]">
            Workflow del expediente
          </p>
          <h3
            id={`${idPrefix}-title`}
            className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--curia-text)] md:text-xl"
          >
            Un expediente. Cinco pasos. El contexto siempre a la vista.
          </h3>
        </div>
        <div className="curia-demo-header-actions">
          <span className="curia-status-badge">Datos simulados</span>
          <button
            type="button"
            className="curia-demo-mode"
            aria-pressed={automatic}
            disabled={prefersReducedMotion}
            onClick={() => setAutomaticRequested((running) => !running)}
          >
            {automatic ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
            {prefersReducedMotion
              ? "Modo manual"
              : automatic
                ? "Pausar automático"
                : "Reanudar automático"}
          </button>
        </div>
      </header>

      <div className="curia-demo-case" aria-label="Expediente de demostración">
        <div>
          <span>Expediente</span>
          <strong>{scenario.caseNumber}</strong>
        </div>
        <div>
          <span>Materia</span>
          <strong>{scenario.matter}</strong>
        </div>
        <div>
          <span>Fuente activa</span>
          <strong>{scenario.activeSource}</strong>
        </div>
      </div>

      <div className="curia-demo-canvas">
        <div
          className="curia-demo-flow"
          role="tablist"
          aria-label="Workflow del expediente"
        >
          {steps.map((step, index) => {
            const StepIcon = STEP_ICONS[step.kind];
            const selected = index === safeIndex;
            const nodeState = selected
              ? "active"
              : index < safeIndex
                ? "complete"
                : "pending";
            const role =
              index === 0
                ? "Entrada"
                : index === steps.length - 1
                  ? "Resultado"
                  : "Proceso";
            return (
              <div className="curia-demo-flow-unit" key={step.id}>
                <button
                  id={`${idPrefix}-tab-${step.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${idPrefix}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className="curia-demo-node"
                  data-state={nodeState}
                  onClick={() => selectManually(index)}
                  onKeyDown={(event) => selectFromKeyboard(event, index)}
                >
                  <span className="curia-demo-node-role">{role}</span>
                  <span className="curia-demo-node-icon" aria-hidden="true">
                    <StepIcon />
                  </span>
                  <span className="curia-demo-node-label">{step.label}</span>
                </button>
                {index < steps.length - 1 ? (
                  <span
                    className="curia-demo-connector"
                    data-state={
                      index < safeIndex
                        ? "complete"
                        : automatic && index === safeIndex
                          ? "running"
                          : "pending"
                    }
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div
        id={`${idPrefix}-panel`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${activeStep.id}`}
        className="curia-demo-panel"
        aria-live={automatic ? "off" : "polite"}
      >
        <div className="curia-demo-panel-heading">
          <span className="curia-demo-panel-icon" aria-hidden="true">
            <ActiveIcon />
          </span>
          <div>
            <p className="curia-demo-step-status">
              Paso {safeIndex + 1} · {activeStep.status}
            </p>
            <h4>{activeStep.title}</h4>
          </div>
        </div>

        <p className="curia-demo-body">{activeStep.body}</p>

        <dl className="curia-demo-facts">
          {activeStep.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div
          className="curia-demo-evidence"
          data-tone={activeStep.evidence.tone}
        >
          <EvidenceIcon aria-hidden="true" />
          <div>
            <p>{activeStep.evidence.label}</p>
            <span>{activeStep.evidence.value}</span>
          </div>
        </div>
      </div>

      <footer className="curia-demo-footer">
        <p>Demostración con datos simulados. No realiza actuaciones reales.</p>
        <div>
          <button
            type="button"
            className="curia-button curia-button-secondary curia-demo-control"
            disabled={safeIndex === 0}
            onClick={() => selectManually(safeIndex - 1)}
          >
            <ArrowLeft aria-hidden="true" />
            Anterior
          </button>
          <button
            type="button"
            className="curia-button curia-button-primary curia-demo-control"
            onClick={() => selectManually(isLastStep ? 0 : safeIndex + 1)}
          >
            {isLastStep ? (
              <>
                Reiniciar recorrido
                <RotateCcw aria-hidden="true" />
              </>
            ) : (
              <>
                Continuar
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </footer>
    </article>
  );
}
