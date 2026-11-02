import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-20 md:pt-44 md:pb-24 bg-gradient-to-b from-[#E6F1FA]/80 via-white to-[#F5F7FA] font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#008BD7_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-[600px] h-[400px] bg-[#63B723]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#008BD7]/30 text-[#031F4C] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-5 sm:mb-6 shadow-sm">
            <Sparkles size={14} className="text-[#008BD7]" />
            <span>About Shree Energy (Pvt) Ltd</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#031F4C] tracking-tight leading-tight sm:leading-[1.15] mb-4 sm:mb-6">
            Empowering Homes And Businesses With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008BD7] via-[#046bd2] to-[#63B723]">
              Sustainable Energy
            </span>
          </h1>

          <p className="text-xs sm:text-base md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Bringing reliable, affordable, and future-ready renewable energy systems designed for homes and communities seeking long-term energy independence across Sri Lanka.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
