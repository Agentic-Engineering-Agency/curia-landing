import { useEffect, useRef, useState } from "react";
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
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => setMenuOpen(false);

  // `md:hidden` drops the panel and the toggle at the desktop breakpoint, so clear
  // the open state (and with it the focus trap below) when the viewport crosses it.
  useEffect(() => {
    if (!menuOpen) return;

    const desktop = window.matchMedia("(min-width: 48rem)");
    if (desktop.matches) {
      setMenuOpen(false);
      return;
    }

    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [menuOpen]);

  // The mobile panel covers the viewport, so keep keyboard focus inside it while
  // open, close it with Escape, and hand focus back to the toggle when it closes.
  useEffect(() => {
    if (!menuOpen) return;

    // Keep the visible header controls (logo, toggle) in the cycle and skip the
    // desktop-only links, which are display:none on the mobile breakpoint.
    const getFocusable = () =>
      Array.from(
        headerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      ).filter((element) => element.offsetParent !== null);

    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !focusable.includes(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !focusable.includes(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-[var(--curia-border)] bg-white/90 backdrop-blur-xl">
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
          ref={toggleRef}
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
        <div
          ref={panelRef}
          id="curia-mobile-menu"
          className="absolute inset-x-0 top-full min-h-[calc(100dvh-4.5rem)] border-y border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] shadow-[var(--curia-shadow-lg)] md:hidden"
        >
          <nav className="curia-shell flex flex-col gap-1 py-3" aria-label="Navegación móvil">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl border border-transparent bg-white/70 px-4 py-3 text-base font-medium text-[var(--curia-text-secondary)] transition-[background-color,border-color,color] hover:border-[var(--curia-border)] hover:bg-white hover:text-[var(--curia-text)]"
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contacto"
              className="curia-button curia-button-primary mt-2 w-full shadow-[var(--curia-shadow-sm)]"
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
