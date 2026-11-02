import React from "react";
import SolarCalculator from "./components/SolarCalculator";
import SolarItemShowcase from "./components/SolarItemShowcase";
import SolarSolutionsGrid from "./components/SolarSolutionsGrid";
import InstallationProcess from "./components/InstallationProcess";
import SolarFaq from "./components/SolarFaq";
import HeroSection from "./components/HeroSection";
import WhyChoosUs from "./components/WhyChoosUs";
import CatBanner from "./components/CatBanner";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <HeroSection />
      <SolarCalculator />
      <SolarItemShowcase />
      <SolarSolutionsGrid />
      <InstallationProcess />
      <WhyChoosUs />
      <SolarFaq />
      <CatBanner />
    </div>
  );
}
