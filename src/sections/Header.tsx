import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navigation = [
  { label: "Curia hoy", href: "#estado-actual" },
  { label: "Producto", href: "#monitoreo" },
  { label: "Biblioteca", href: "#biblioteca" },
  { label: "Confianza", href: "#evaluador-referencias" },
  { label: "Contacto", href: "#contacto" },
] as const;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--curia-border)] bg-white/90 backdrop-blur-xl">
      <div className="curia-shell flex min-h-18 items-center justify-between gap-5 py-3">
        <a
          href="#inicio"
          className="inline-flex shrink-0 items-center gap-3"
          aria-label="Curia, ir al inicio"
          onClick={closeMenu}
        >
          <span className="curia-logo-mark" aria-hidden="true">
            C
          </span>
          <span>
            <span className="curia-display block text-[1.55rem] leading-none tracking-[-0.02em]">Curia</span>
            <span className="mt-1 hidden text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-[var(--curia-text-muted)] sm:block">
              Inteligencia legal
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--curia-text-secondary)] transition-colors hover:bg-[var(--curia-bg-subtle)] hover:text-[var(--curia-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#contacto" className="curia-button curia-button-primary hidden! shrink-0 lg:inline-flex!">
          Conversemos sobre tu operación
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--curia-border-strong)] bg-white text-[var(--curia-text)] shadow-sm md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="curia-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {menuOpen ? (
        <div id="curia-mobile-menu" className="border-t border-[var(--curia-border)] bg-white md:hidden">
          <nav className="curia-shell flex flex-col gap-1 py-4" aria-label="Navegación móvil">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-base font-medium text-[var(--curia-text-secondary)] hover:bg-[var(--curia-bg-subtle)] hover:text-[var(--curia-text)]"
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contacto"
              className="curia-button curia-button-primary mt-3 w-full"
              onClick={closeMenu}
            >
              Conversemos sobre tu operación
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
