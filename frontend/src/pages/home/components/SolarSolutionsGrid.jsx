import React from "react";
import { Link } from "react-router-dom";
import { BatteryCharging, Building2, Sun, Wrench, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { servicesData } from "../../../data/dataset";

export default function SolarSolutionsGrid() {
  const iconMap = {
    storage: BatteryCharging,
    commercial: Building2,
    residential: Sun,
    upgrade: Wrench,
  };

  return (
    <section id="services" className="scroll-mt-24 sm:scroll-mt-32 py-16 sm:py-24 bg-[#0F172B] text-white relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#008BD7]/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#63B723]/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008BD7]/10 border border-[#008BD7]/30 text-[#008BD7] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-sm">
            <Sparkles size={14} />
            <span>Shree Energy Services</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Renewable Energy Services For A Greener Future
          </h2>
          <p className="text-slate-400 text-xs sm:text-base mt-2 sm:mt-3 font-light leading-relaxed max-w-xl mx-auto">
            We deliver innovative solutions that advance sustainability and promote clean energy for a brighter, more independent Sri Lanka.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {servicesData.map((sol) => {
            const Icon = iconMap[sol.id] || Sun;
            return (
              <div
                key={sol.title}
                className={`${sol.className} group relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-slate-900/80 border border-slate-800 hover:border-[#008BD7]/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between`}
              >
                {/* Subtle gradient glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${sol.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white/5 border border-white/10 text-[#008BD7] flex items-center justify-center group-hover:bg-[#008BD7] group-hover:text-white transition-all shadow-inner">
                      <Icon size={22} className="sm:w-6 sm:h-6" />
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full border ${sol.badgeColor}`}>
                      {sol.tag}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs font-bold text-[#63B723] uppercase tracking-wider mb-1">
                    {sol.subtitle}
                  </p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-[#008BD7] transition-colors leading-snug">
                    {sol.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                    {sol.desc}
                  </p>
                </div>

                <div className="relative z-10 mt-5 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#63B723] shrink-0" />
                    <span>{sol.metrics}</span>
                  </span>
                  <Link
                    to={sol.link}
                    className="text-xs font-bold text-[#008BD7] group-hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>Learn More & Contact</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
