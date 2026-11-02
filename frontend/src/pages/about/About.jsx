import React from "react";
import AboutHero from "./components/AboutHero";
import AboutJourney from "./components/AboutJourney";
import ChairmanMessage from "./components/ChairmanMessage";
import AboutValues from "./components/AboutValues";
import AboutCertifications from "./components/AboutCertifications";
import CtaSection from "./components/CtaSection";

export default function About() {
  return (
    <div className="w-full bg-[#F5F7FA] min-h-screen font-sans">
      <AboutHero />
      <AboutJourney />
      <ChairmanMessage />
      <AboutValues />
      <AboutCertifications />
      <CtaSection />
    </div>
  );
}
