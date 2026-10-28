import React from "react";
import AboutHero from "./components/AboutHero";
import AboutValues from "./components/AboutValues";
import AboutMilestones from "./components/AboutMilestones";
import AboutCertifications from "./components/AboutCertifications";
import CtaSection from "./components/CtaSection";

export default function About() {
  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <AboutHero />
      <AboutValues />
      <AboutMilestones />
      <AboutCertifications />
      <CtaSection />
    </div>
  );
}
