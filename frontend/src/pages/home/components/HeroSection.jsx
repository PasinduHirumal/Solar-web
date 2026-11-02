import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Zap, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { contactDetails } from "../../../data/dataset";

export default function HeroSection() {
  const whatsappNumber = contactDetails.whatsapp.clean;

  const scrollToCalculator = () => {
    const el = document.getElementById("calculator");
    if (el) {
      const navOffset = window.innerWidth >= 768 ? 95 : 75;
      const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28 bg-gradient-to-b from-[#E6F1FA]/70 via-white to-[#F5F7FA] font-sans">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#008BD7]/15 via-[#63B723]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-24 right-10 w-72 h-72 bg-[#008BD7]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Shree Energy Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-white/95 border border-[#008BD7]/30 text-[#031F4C] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-5 sm:mb-6 shadow-sm backdrop-blur-md max-w-full truncate">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#63B723] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#63B723]"></span>
          </span>
          <span className="text-[#008BD7] font-black truncate">SHREE ENERGY (Pvt Ltd)</span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-600 font-medium hidden sm:inline">Sri Lanka's Trusted Solar Provider</span>
        </div>

        {/* Main Title matching shreenergy.com */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#031F4C] tracking-tight max-w-5xl mx-auto leading-tight sm:leading-[1.12]">
          Powering Sri Lanka with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008BD7] via-[#046bd2] to-[#63B723]">
            Smart Energy Solutions
          </span>
        </h1>

        {/* Tagline matching shreenergy.com */}
        <p className="text-sm sm:text-xl md:text-2xl font-bold text-[#63B723] mt-2.5 sm:mt-4 tracking-wide uppercase">
          Reliable. Sustainable. Affordable.
        </p>

        {/* Description matching shreenergy.com */}
        <p className="text-xs sm:text-base md:text-lg text-slate-600 mt-2.5 sm:mt-4 max-w-2xl mx-auto leading-relaxed font-normal">
          We provide high quality solar energy products and services to power your home, business, and a better tomorrow across Sri Lanka.
        </p>

        {/* Actions - Fully Responsive Stacking */}
        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-md sm:max-w-none mx-auto">
          <Link
            to="/contact"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#008BD7] to-[#046bd2] hover:from-[#0076B8] hover:to-[#008BD7] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[#008BD7]/25 hover:shadow-[#008BD7]/40 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Contact Shree Energy</span>
            <ArrowRight size={15} />
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white border border-[#63B723]/50 text-[#63B723] hover:bg-[#EBF7E5] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaWhatsapp size={17} />
            <span>WhatsApp Consultation</span>
          </a>

          <button
            type="button"
            onClick={scrollToCalculator}
            className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-full bg-slate-100 hover:bg-slate-200 text-[#031F4C] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calculator size={16} className="text-[#008BD7]" />
            <span>Solar Calculator</span>
          </button>
        </div>

        {/* Marquee Banner - Never causes horizontal scroll */}
        <div className="mt-10 sm:mt-12 overflow-hidden py-3 bg-[#031F4C] text-white rounded-xl sm:rounded-2xl shadow-inner flex items-center max-w-full">
          <div className="flex animate-marquee whitespace-nowrap gap-6 sm:gap-8 text-[11px] sm:text-sm font-extrabold uppercase tracking-widest text-slate-200">
            <span className="flex items-center gap-2 text-[#63B723]">★ PREMIUM QUALITY SOLAR PRODUCTS</span>
            <span>•</span>
            <span className="flex items-center gap-2 text-[#008BD7]">★ 25-YEAR PERFORMANCE WARRANTY</span>
            <span>•</span>
            <span className="flex items-center gap-2 text-amber-400">★ CERTIFIED TIER-1 PV MODULES</span>
            <span>•</span>
            <span className="flex items-center gap-2 text-[#63B723]">★ HIGH-EFFICIENCY LiFePO4 STORAGE</span>
            <span>•</span>
            <span className="flex items-center gap-2 text-[#008BD7]">★ DYNESS • LITHTECH • SUMRY • BASENGREEN</span>
            <span>•</span>
            <span className="flex items-center gap-2 text-[#63B723]">★ PREMIUM QUALITY SOLAR PRODUCTS</span>
            <span>•</span>
            <span className="flex items-center gap-2 text-[#008BD7]">★ 25-YEAR PERFORMANCE WARRANTY</span>
          </div>
        </div>

        {/* Key Metrics Row from shreenergy.com */}
        <div className="mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto pt-6 sm:pt-8 border-t border-slate-200/80">
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#008BD7]">500+</p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-semibold mt-0.5 sm:mt-1">Happy Customers</p>
          </div>
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#63B723]">15+ MW</p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-semibold mt-0.5 sm:mt-1">Solar Installations</p>
          </div>
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#008BD7]">10+ Yrs</p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-semibold mt-0.5 sm:mt-1">Engineering Experience</p>
          </div>
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#63B723]">24/7</p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-semibold mt-0.5 sm:mt-1">Customer Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
