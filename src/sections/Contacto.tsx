import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  CloudCog,
  FolderKanban,
  Landmark,
  LoaderCircle,
  Mail,
  Phone,
} from "lucide-react";

type RequiredField = "name" | "email" | "message";

type SubmitStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | {
      kind: "error";
      message: string;
      invalidFields?: readonly RequiredField[];
    };

const CONTACT_ERROR_MESSAGE =
  "No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por correo.";

const conversationTopics = [
  {
    icon: Landmark,
    title: "Punto de partida operativo",
    body: "Revisemos qué fuentes judiciales usa el despacho y si Jalisco CJJ forma parte de su operación actual.",
  },
  {
    icon: FolderKanban,
    title: "Flujo por expediente",
    body: "Identifiquemos dónde se separan hoy los avisos, plazos, documentos y consultas del equipo.",
  },
  {
    icon: CloudCog,
    title: "Requisitos de Microsoft 365",
    body: "Confirmemos la conexión y el consentimiento administrativo necesarios para crear eventos de Outlook en el entorno real del despacho.",
  },
];

export default function Contacto() {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    kind: "idle",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitStatus.kind === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const company = String(formData.get("firm") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const invalidFields: RequiredField[] = [];
    if (!name) invalidFields.push("name");
    if (!email) invalidFields.push("email");
    if (!message) invalidFields.push("message");

    if (invalidFields.length > 0) {
      setSubmitStatus({
        kind: "error",
        message: "Completa nombre, correo y mensaje.",
        invalidFields,
      });
      return;
    }

    setSubmitStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          company: company || undefined,
        }),
      });
      const responseData = (await response.json().catch(() => null)) as {
        ok?: boolean;
      } | null;

      if (response.ok && responseData?.ok) {
        setSubmitStatus({ kind: "success" });
        form.reset();
        return;
      }

      setSubmitStatus({ kind: "error", message: CONTACT_ERROR_MESSAGE });
    } catch {
      setSubmitStatus({ kind: "error", message: CONTACT_ERROR_MESSAGE });
    }
  };

  const isFieldInvalid = (field: RequiredField) =>
    submitStatus.kind === "error" &&
    submitStatus.invalidFields?.includes(field);

  return (
    <section id="contacto" className="py-16 md:py-24">
      <div className="curia-shell">
        <div className="max-w-4xl space-y-4">
          <p className="curia-caption text-[var(--curia-primary-text)]">
            Contacto
          </p>
          <h2 className="curia-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] md:text-[3.7rem]">
            Si tu despacho quiere conectar monitoreo, plazos y documentos,
            conversemos.
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-[var(--curia-text-secondary)]">
            Cuéntanos cómo revisan hoy sus expedientes, coordinan fechas y
            preparan investigación. Podemos revisar si el alcance actual de
            Curia corresponde a su operación y qué requisitos necesita el flujo
            de Microsoft 365.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <div className="space-y-5">
            <div className="space-y-3">
              {conversationTopics.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="curia-card grid gap-4 p-5 sm:grid-cols-[2.75rem_minmax(0,1fr)]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--curia-primary-light)] text-[var(--curia-primary-text)]">
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
                </article>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <a className="curia-contact-card" href="tel:+523322412595">
                <Phone
                  className="h-5 w-5 shrink-0 text-[var(--curia-primary)]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="curia-caption">Teléfono</p>
                  <p className="mt-2 text-lg tracking-[-0.02em]">
                    +52 33 2241 2595
                  </p>
                </div>
              </a>
              <a
                className="curia-contact-card"
                href="mailto:info@agenticengineering.agency"
              >
                <Mail
                  className="h-5 w-5 shrink-0 text-[var(--curia-primary)]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="curia-caption">Correo</p>
                  <p className="mt-2 break-all text-base tracking-[-0.02em] sm:text-[0.95rem] lg:text-base">
                    info@agenticengineering.agency
                  </p>
                </div>
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="curia-card-editorial p-6 md:p-8"
          >
            <fieldset
              disabled={submitStatus.kind === "submitting"}
              className="contents"
            >
              <legend className="sr-only">
                Datos para solicitar una conversación
              </legend>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="curia-field rounded-[1.25rem] border border-[var(--curia-border-strong)] bg-white/75 p-4 shadow-[0_1px_0_rgba(26,32,40,0.04)] transition-[border-color,box-shadow] focus-within:border-[var(--curia-primary)] focus-within:ring-4 focus-within:ring-[color:rgba(13,115,119,0.14)]">
                  <span>Nombre</span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    aria-invalid={isFieldInvalid("name") || undefined}
                    aria-describedby={
                      isFieldInvalid("name") ? "contact-form-error" : undefined
                    }
                  />
                </label>
                <label className="curia-field rounded-[1.25rem] border border-[var(--curia-border-strong)] bg-white/75 p-4 shadow-[0_1px_0_rgba(26,32,40,0.04)] transition-[border-color,box-shadow] focus-within:border-[var(--curia-primary)] focus-within:ring-4 focus-within:ring-[color:rgba(13,115,119,0.14)]">
                  <span>Despacho</span>
                  <input name="firm" placeholder="Nombre del despacho" />
                </label>
              </div>

              <label className="curia-field mt-4 rounded-[1.25rem] border border-[var(--curia-border-strong)] bg-white/75 p-4 shadow-[0_1px_0_rgba(26,32,40,0.04)] transition-[border-color,box-shadow] focus-within:border-[var(--curia-primary)] focus-within:ring-4 focus-within:ring-[color:rgba(13,115,119,0.14)]">
                <span>Correo de contacto</span>
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@despacho.com"
                  aria-invalid={isFieldInvalid("email") || undefined}
                  aria-describedby={
                    isFieldInvalid("email") ? "contact-form-error" : undefined
                  }
                />
              </label>

              <label className="curia-field mt-4 rounded-[1.25rem] border border-[var(--curia-border-strong)] bg-white/75 p-4 shadow-[0_1px_0_rgba(26,32,40,0.04)] transition-[border-color,box-shadow] focus-within:border-[var(--curia-primary)] focus-within:ring-4 focus-within:ring-[color:rgba(13,115,119,0.14)]">
                <span>¿Qué te gustaría explorar con Curia?</span>
                <textarea
                  required
                  name="message"
                  rows={6}
                  placeholder="Cuéntanos qué expedientes monitorean, cómo coordinan plazos o qué problema quieren resolver primero."
                  aria-invalid={isFieldInvalid("message") || undefined}
                  aria-describedby={
                    isFieldInvalid("message")
                      ? "contact-form-error"
                      : undefined
                  }
                />
              </label>

              <div className="mt-6 flex flex-col gap-3 border-t border-[var(--curia-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p
                  role="status"
                  aria-atomic="true"
                  className="max-w-md text-sm leading-6 text-[var(--curia-text-secondary)]"
                >
                  {submitStatus.kind === "success"
                    ? "Recibimos tu mensaje. El equipo de Curia dará seguimiento por correo."
                    : "Al enviar, registraremos tu mensaje en nuestro CRM para darle seguimiento."}
                </p>
                <button
                  type="submit"
                  className="curia-button curia-button-primary"
                  aria-busy={submitStatus.kind === "submitting"}
                >
                  {submitStatus.kind === "submitting" ? (
                    <>
                      Enviando
                      <LoaderCircle
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    </>
                  ) : submitStatus.kind === "success" ? (
                    <>
                      Mensaje enviado
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Solicitar conversación
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>

              {submitStatus.kind === "error" && (
                <p
                  id="contact-form-error"
                  role="alert"
                  className="mt-4 rounded-lg border border-[color:rgba(220,38,38,0.25)] bg-[color:rgba(220,38,38,0.05)] px-4 py-3 text-sm leading-6 text-[color:rgb(153,27,27)]"
                >
                  {submitStatus.message}
                </p>
              )}
            </fieldset>
          </form>
        </div>
      </div>
    </section>
  );
}
