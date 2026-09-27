import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { CapabilityStrip } from "./components/CapabilityStrip";
import { Story } from "./components/Story";
import { Showcase } from "./components/Showcase";
import { Features } from "./components/Features";
import { ReservationDemo } from "./components/ReservationDemo";
import { Download } from "./components/Download";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { CustomCursor } from "./components/CustomCursor";
import { Preloader } from "./components/Preloader";

export default function App() {
  return (
    <>
      <Preloader />
      <a href="#kesfet" className="skip-link">
        Məzmunu ötür
      </a>
      <Header />
      <main>
        <Hero />
        <CapabilityStrip />
        <Story />
        <Showcase />
        <Features />
        <ReservationDemo />
        <Download />
        <Faq />
      </main>
      <Footer />
      <CustomCursor />
    </>
  );
}
