import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { DESKTOP_BREAKPOINT, STANDARD_EASE } from "../components/motion";

const navigation = [
  { label: "Curia hoy", href: "#estado-actual" },
  { label: "Producto", href: "#monitoreo" },
  { label: "Biblioteca", href: "#biblioteca" },
  { label: "Confianza", href: "#evaluador-referencias" },
  { label: "Contacto", href: "#contacto" },
] as const;

const FOCUSABLE_ELEMENTS =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const skipScrollRestoreRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  const closeMenuForNavigation = () => {
    skipScrollRestoreRef.current = true;
    setMenuOpen(false);
  };

  useLayoutEffect(() => {
    if (!menuOpen) return;

    // Mirror Tailwind's `md` breakpoint exactly: the panel and toggle are
    // `md:hidden`, so a fixed pixel query would drift from the CSS whenever the
    // browser's root font size is not 16px and leave the menu state stuck open.
    const desktopMediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT})`);
    if (desktopMediaQuery.matches) {
      setMenuOpen(false);
      return;
    }

    skipScrollRestoreRef.current = false;

    const body = document.body;
    const bodyStyle = body.getAttribute("style");
    const scrollPosition = { x: window.scrollX, y: window.scrollY };
    const backgroundLandmarks = Array.from(
      document.querySelectorAll<HTMLElement>("main, footer"),
      (element) => ({
        element,
        inertAttribute: element.getAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden"),
      }),
    );

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const bodyPaddingRight =
      Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.position = "fixed";
    body.style.inset = `${-scrollPosition.y}px 0 0 ${-scrollPosition.x}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }

    for (const { element } of backgroundLandmarks) {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    }

    const focusableElements = Array.from(
      menuPanelRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_ELEMENTS,
      ) ?? [],
    );

    focusableElements[0]?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        menuPanelRef.current?.focus({ preventScroll: true });
        return;
      }

      const activeElement = document.activeElement;
      if (
        event.shiftKey &&
        (activeElement === firstElement ||
          !menuPanelRef.current?.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement ||
          !menuPanelRef.current?.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const preventBackgroundScroll = (event: Event) => {
      const target = event.target;
      if (
        event.cancelable &&
        (!(target instanceof Node) ||
          !menuPanelRef.current?.contains(target))
      ) {
        event.preventDefault();
      }
    };

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", preventBackgroundScroll, {
      passive: false,
    });
    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });
    desktopMediaQuery.addEventListener("change", handleDesktopChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      desktopMediaQuery.removeEventListener("change", handleDesktopChange);

      if (bodyStyle === null) {
        const styleAttribute = body.getAttributeNode("style");
        if (styleAttribute) body.removeAttributeNode(styleAttribute);
      } else {
        body.setAttribute("style", bodyStyle);
      }

      for (const {
        element,
        inertAttribute,
        ariaHidden,
      } of backgroundLandmarks) {
        if (inertAttribute === null) {
          element.removeAttribute("inert");
        } else {
          element.setAttribute("inert", inertAttribute);
        }

        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      }

      if (!skipScrollRestoreRef.current) {
        window.scrollTo(scrollPosition.x, scrollPosition.y);
      }

      if (menuButtonRef.current?.isConnected) {
        menuButtonRef.current.focus({ preventScroll: true });
      }
    };
  }, [menuOpen]);
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--curia-border)] bg-white/90 backdrop-blur-xl">
      <div className="curia-shell flex min-h-[var(--curia-header-h)] items-center justify-between gap-5 py-3">
        <a
          href="#inicio"
          className="inline-flex shrink-0 items-center gap-3"
          aria-label="Curia, ir al inicio"
          onClick={closeMenuForNavigation}
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
          ref={menuButtonRef}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="curia-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence
        initial={false}
        onExitComplete={() => {
          if (!menuOpen && menuButtonRef.current?.isConnected) {
            menuButtonRef.current.focus({ preventScroll: true });
          }
        }}
      >
        {menuOpen ? (
          <motion.div
            key="curia-mobile-menu"
            ref={menuPanelRef}
            id="curia-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación móvil"
            tabIndex={-1}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh_-_var(--curia-header-h))] min-h-[calc(100dvh_-_var(--curia-header-h))] overflow-y-auto overscroll-contain border-y border-[var(--curia-border)] bg-[var(--curia-bg-subtle)] shadow-[var(--curia-shadow-lg)] md:hidden"
            initial={
              shouldReduceMotion ? false : { opacity: 0, y: -8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -8 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.22,
              ease: STANDARD_EASE,
            }}
          >
            <nav
              className="curia-shell flex flex-col gap-1 py-3"
              aria-label="Navegación móvil"
            >
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-transparent bg-white/70 px-4 py-3 text-base font-medium text-[var(--curia-text-secondary)] transition-[background-color,border-color,color] hover:border-[var(--curia-border)] hover:bg-white hover:text-[var(--curia-text)]"
                  onClick={closeMenuForNavigation}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contacto"
                className="curia-button curia-button-primary mt-2 w-full shadow-[var(--curia-shadow-sm)]"
                onClick={closeMenuForNavigation}
              >
                Conversemos sobre tu operación
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
