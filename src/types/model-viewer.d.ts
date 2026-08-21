// Declaración JSX del custom element de model-viewer (cargado por CDN, fuera
// del bundle). Sólo los atributos que la landing usa.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        alt?: string;
        exposure?: string;
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "manual";
        "camera-orbit"?: string;
        "field-of-view"?: string;
        "shadow-intensity"?: string;
        "interaction-prompt"?: "auto" | "none";
        "disable-zoom"?: boolean;
        "disable-tap"?: boolean;
      };
    }
  }
}
