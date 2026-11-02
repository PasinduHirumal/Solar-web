import React from "react";
import { Quote, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import logoCircle from "../../../assets/logo/logo_circle.jpg";

export default function ChairmanMessage() {
  return (
    <section className="py-16 sm:py-24 bg-[#0F172B] text-white relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#008BD7]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#63B723]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-xs font-bold text-[#63B723] uppercase tracking-widest bg-[#63B723]/10 px-3.5 py-1.5 rounded-full border border-[#63B723]/30">
            Leadership & Guidance
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-3 leading-tight">
            Chairman Message
          </h2>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 md:p-14 relative shadow-2xl backdrop-blur-md">
          <Quote className="text-[#008BD7]/20 absolute top-6 right-6 sm:top-10 sm:right-10 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none" />

          <div className="relative z-10 space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-2xl font-bold text-[#008BD7]">
              Welcome to Shree Energy Pvt Ltd.
            </h3>

            <p className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed font-light">
              At Shree Energy, we are committed to delivering innovative and sustainable energy solutions that create lasting value for our customers and communities. Our focus on quality, reliability, and customer satisfaction drives everything we do.
            </p>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-light">
              As we continue to grow, we remain dedicated to building a cleaner and more energy-efficient future through excellence, innovation, and trust. Thank you for your support and confidence in Shree Energy.
            </p>

            <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <img
                  src={logoCircle}
                  alt="Chairman Shree Energy"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-[#008BD7] shadow-md shadow-[#008BD7]/20"
                />
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white leading-tight">
                    Chairman
                  </h4>
                  <p className="text-xs text-[#63B723] font-semibold mt-0.5">
                    Shree Energy (Pvt) Ltd
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Colombo, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl w-fit">
                <ShieldCheck size={16} className="text-[#63B723]" />
                <span>Committed to Excellence & Trust</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
