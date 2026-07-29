import { MotionConfig } from "motion/react";
import AmbientBackground from "./components/AmbientBackground";
import Header from "./sections/Header";
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
    <MotionConfig reducedMotion="user">
      <div className="relative isolate min-h-screen bg-[var(--curia-bg)] text-[var(--curia-text)]">
        <AmbientBackground />

        <div className="relative z-10">
          <Header />

          <main>
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
    </MotionConfig>
  );
}
