import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { contactDetails } from "../../../data/dataset";

export default function CatBanner() {
  const whatsappNumber = contactDetails.whatsapp.clean;

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-r from-[#031F4C] via-[#008BD7] to-[#031F4C] text-white relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#63B723]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
          <Sparkles size={13} className="text-[#63B723]" />
          <span>Shree Energy Consultation</span>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-tight">
          Ready to Upgrade Your Home?
        </h2>
        <p className="text-xs sm:text-base md:text-lg text-slate-100 max-w-2xl mx-auto font-light mb-7 sm:mb-8 leading-relaxed">
          Experience the perfect blend of quality and affordability. Speak directly with our certified solar engineers today for technical guidance.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
          <Link
            to="/contact"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#031F4C] hover:bg-slate-100 font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Contact Our Team</span>
            <ArrowRight size={15} className="text-[#008BD7]" />
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-[#63B723] hover:bg-[#549E1E] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#63B723]/30"
          >
            <FaWhatsapp size={17} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
