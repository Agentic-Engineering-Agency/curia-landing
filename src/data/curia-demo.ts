export type CuriaDemoStepKind =
  | "movement"
  | "deadline"
  | "calendar"
  | "library"
  | "references";

export type CuriaDemoEvidenceTone =
  | "source"
  | "attention"
  | "ready"
  | "verified";

export interface CuriaDemoFact {
  readonly label: string;
  readonly value: string;
}

export interface CuriaDemoEvidence {
  readonly label: string;
  readonly value: string;
  readonly tone: CuriaDemoEvidenceTone;
}

export interface CuriaDemoStep {
  readonly id: string;
  readonly kind: CuriaDemoStepKind;
  readonly label: string;
  readonly status: string;
  readonly title: string;
  readonly body: string;
  readonly facts: readonly CuriaDemoFact[];
  readonly evidence: CuriaDemoEvidence;
}

export interface CuriaDemoScenario {
  readonly id: string;
  readonly caseNumber: string;
  readonly matter: string;
  readonly activeSource: string;
  readonly steps: readonly CuriaDemoStep[];
}

export const DEFAULT_CURIA_DEMO_SCENARIO: CuriaDemoScenario = {
  id: "expediente-demo-123-2026",
  caseNumber: "123/2026",
  matter: "Civil",
  activeSource: "Jalisco CJJ",
  steps: [
    {
      id: "movement",
      kind: "movement",
      label: "Movimiento",
      status: "Detectado",
      title: "El aviso llega al expediente correcto.",
      body: "Curia relaciona el movimiento con el expediente registrado y conserva la fuente para que el equipo pueda revisarla.",
      facts: [
        { label: "Movimiento", value: "Acuerdo publicado" },
        { label: "Origen", value: "Boletín judicial" },
      ],
      evidence: {
        label: "Procedencia conservada",
        value: "Documento de origen disponible para revisión",
        tone: "source",
      },
    },
    {
      id: "deadline",
      kind: "deadline",
      label: "Plazo",
      status: "Revisión requerida",
      title: "El plazo se propone con su contexto.",
      body: "Curia presenta una fecha de trabajo y los datos usados para obtenerla. La persona abogada debe cotejarla contra el documento original y la legislación aplicable.",
      facts: [
        { label: "Vencimiento propuesto", value: "09 sep 2026" },
        { label: "Prioridad", value: "Alta" },
      ],
      evidence: {
        label: "Control profesional",
        value: "Fecha pendiente de confirmación por el equipo",
        tone: "attention",
      },
    },
    {
      id: "calendar",
      kind: "calendar",
      label: "Outlook",
      status: "Listo para confirmar",
      title: "El evento conserva la referencia del asunto.",
      body: "Con Microsoft 365 conectado y los permisos necesarios, el equipo revisa el evento antes de crearlo en Outlook.",
      facts: [
        { label: "Evento", value: "Revisar acuerdo · 123/2026" },
        { label: "Recordatorio", value: "24 horas antes" },
      ],
      evidence: {
        label: "Vista previa",
        value: "Ningún evento se crea durante esta demostración",
        tone: "ready",
      },
    },
    {
      id: "library",
      kind: "library",
      label: "Biblioteca",
      status: "Procesado",
      title: "El documento se vuelve una fuente elegible.",
      body: "La Biblioteca muestra el estado del OCR y permite seleccionar explícitamente el archivo que podrá usar el asistente del expediente.",
      facts: [
        { label: "Documento", value: "acuerdo-123-2026.pdf" },
        { label: "OCR", value: "Procesado" },
      ],
      evidence: {
        label: "Fuente seleccionada",
        value: "Disponible para la consulta de este expediente",
        tone: "ready",
      },
    },
    {
      id: "references",
      kind: "references",
      label: "Referencias",
      status: "Confianza visible",
      title: "La respuesta llega con evidencia y límites.",
      body: "Curia responde desde las fuentes seleccionadas y muestra por separado el estado de las referencias evaluadas antes de que el equipo decida usarlas.",
      facts: [
        { label: "Fuente documental", value: "Acuerdo · página 2" },
        { label: "Evaluación", value: "Coincidencia simulada con SJF" },
      ],
      evidence: {
        label: "Referencia verificada",
        value: "Coincidencia de demostración encontrada en SJF",
        tone: "verified",
      },
    },
  ],
};
