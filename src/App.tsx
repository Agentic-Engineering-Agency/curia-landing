import { ClientOnly } from "@tanstack/react-router";
import AmbientBackground from "./components/AmbientBackground";
import DotField from "./components/DotField";
import Header from "./sections/Header";
import Pelicula, { PeliculaFallback } from "./sections/Pelicula";
import Hero from "./sections/Hero";
import EstadoActual from "./sections/EstadoActual";
import Monitoreo from "./sections/Monitoreo";
import PlazosOutlook from "./sections/PlazosOutlook";
import Biblioteca from "./sections/Biblioteca";
import Ocr from "./sections/Ocr";
import Asistentes from "./sections/Asistentes";
import EvaluadorReferencias from "./sections/EvaluadorReferencias";
import Fuentes from "./sections/Fuentes";
import Privacidad from "./sections/Privacidad";
import Despacho from "./sections/Despacho";
import Contacto from "./sections/Contacto";
import Footer from "./sections/Footer";

export default function App() {
  return (
    <div className="relative isolate min-h-screen bg-[var(--curia-bg)] text-[var(--curia-text)]">
      <DotField />
      <AmbientBackground />

      <div className="relative z-10">
        <Header />

        <main>
          <ClientOnly fallback={<PeliculaFallback />}>
            <Pelicula />
          </ClientOnly>
          <Hero />
          <EstadoActual />
          <Monitoreo />
          <PlazosOutlook />
          <Biblioteca />
          <Ocr />
          <Asistentes />
          <EvaluadorReferencias />
          <Fuentes />
          <Privacidad />
          <Despacho />
          <Contacto />
        </main>

        <Footer />
      </div>
    </div>
  );
}
