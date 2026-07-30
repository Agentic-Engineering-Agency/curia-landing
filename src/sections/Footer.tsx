export default function Footer() {
  return (
    <footer
      className="border-t border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] py-8"
    >
      <div className="curia-shell flex flex-col gap-3 text-sm leading-6 text-[var(--curia-text-secondary)] md:flex-row md:items-center md:justify-between md:gap-8">
        <p className="max-w-3xl">
          Curia — inteligencia legal para despachos mexicanos. Herramienta de
          apoyo: toda salida de IA requiere revisión profesional.
        </p>
        <p className="shrink-0">
          © 2026 Agentic Engineering.
        </p>
      </div>
    </footer>
  );
}
