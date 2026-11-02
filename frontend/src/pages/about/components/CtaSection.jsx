import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { contactDetails } from "../../../data/dataset";

export default function CtaSection() {
  const whatsappNumber = contactDetails.whatsapp.clean;

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-r from-[#031F4C] via-[#008BD7] to-[#031F4C] text-white font-sans">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#63B723]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
          <Sparkles size={14} className="text-[#63B723]" />
          <span>Start Your Clean Journey</span>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight leading-tight">
          Ready to Transition to Clean Solar Energy?
        </h2>
        <p className="text-xs sm:text-base md:text-lg text-slate-100 mb-7 sm:mb-8 max-w-2xl mx-auto font-light leading-relaxed">
          Contact our certified solar engineering team today for property assessment, system sizing, and sustainable power advice tailored to your needs.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
          <Link
            to="/contact"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#031F4C] hover:bg-slate-100 font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>Contact Us Today</span>
            <ArrowRight size={15} className="text-[#008BD7]" />
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-[#63B723] hover:bg-[#549E1E] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#63B723]/30 flex items-center justify-center gap-2"
          >
            <FaWhatsapp size={17} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
