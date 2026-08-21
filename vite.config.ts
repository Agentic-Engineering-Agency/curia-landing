import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Rutas relativas a la raíz del proyecto: evita depender de @types/node.
      input: {
        // Landing de producción.
        main: "index.html",
        // Demo de validación de la secuencia del despacho. Aislada: no
        // comparte bundle ni estilos con la landing.
        demo: "demo/index.html",
        // Alternativa en video de la misma secuencia. Entrada aparte para que
        // ninguna de las dos demos pese sobre la landing.
        "demo-video": "demo-video/index.html",
      },
    },
  },
});
