import { createElement } from "react";
import type { ReactNode } from "react";

type RevealElement = "div" | "section" | "article" | "li";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Conservado en la API para no ensuciar callsites; ya no bloquea pintura. */
  delay?: number;
  y?: number;
  as?: RevealElement;
};

/**
 * Contenedor semántico sin runtime de animación. El contenido entra visible en
 * SSR y no espera IntersectionObserver/hidratación para pintar.
 */
export default function Reveal({
  children,
  className,
  as = "div",
}: RevealProps) {
  return createElement(as, { className }, children);
}
