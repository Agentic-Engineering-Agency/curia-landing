import { createFileRoute } from "@tanstack/react-router";
import App from "../App";

export const Route = createFileRoute("/")({
  // La película elige su variante por aspect-ratio al montar y la página usa
  // canvas/model-viewer dependientes del navegador. El shell y metadata se
  // renderizan en servidor; la experiencia visual se monta en cliente sin
  // riesgo de hydration mismatch entre encuadre ancho y retrato.
  ssr: false,
  component: App,
});
