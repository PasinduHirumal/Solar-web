import React from "react";
import HeroSection from "./components/HeroSection";
import BrandPartners from "./components/BrandPartners";
import SolarSolutionsGrid from "./components/SolarSolutionsGrid";
import SolarCalculator from "./components/SolarCalculator";
import SolarItemShowcase from "./components/SolarItemShowcase";
import InstallationProcess from "./components/InstallationProcess";
import WhyChoosUs from "./components/WhyChoosUs";
import SolarFaq from "./components/SolarFaq";
import CatBanner from "./components/CatBanner";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] text-slate-800 overflow-x-hidden font-sans">
      <HeroSection />
      <BrandPartners />
      <SolarSolutionsGrid />
      <SolarCalculator />
      <SolarItemShowcase />
      <InstallationProcess />
      <WhyChoosUs />
      <SolarFaq />
      <CatBanner />
    </div>
  );
}
