import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Cpu, Zap, BatteryCharging, Sparkles } from "lucide-react";
import { brandPartnersData } from "../../../data/dataset";

export default function BrandPartners() {
  const iconMap = {
    dyness: BatteryCharging,
    lithtech: Cpu,
    sumry: Zap,
    basengreen: ShieldCheck,
  };

  return (
    <section id="partners" className="scroll-mt-24 sm:scroll-mt-32 py-16 sm:py-24 bg-white border-t border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF7E5] border border-[#63B723]/30 text-[#63B723] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-2xs">
            <Sparkles size={14} />
            <span>Authorized Global Manufacturers</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#031F4C] tracking-tight leading-tight">
            Smart Features, Technology Driven Systems Designed
          </h2>
          <p className="text-slate-600 text-xs sm:text-base mt-2 sm:mt-3 font-normal leading-relaxed max-w-xl mx-auto">
            Shree Energy collaborates exclusively with world-class manufacturers to equip your installation with certified, long-life solar hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {brandPartnersData.map((b) => {
            const Icon = iconMap[b.id] || BatteryCharging;
            return (
              <div
                key={b.name}
                className="group relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-[#F5F7FA] border border-slate-200/90 hover:bg-white hover:border-[#008BD7]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#63B723] bg-[#EBF7E5] px-2.5 py-0.5 rounded-full border border-[#63B723]/30">
                      {b.badge}
                    </span>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#008BD7] group-hover:bg-[#008BD7] group-hover:text-white transition-colors">
                      <Icon size={19} />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#031F4C] mb-1 group-hover:text-[#008BD7] transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-bold text-[#008BD7] uppercase tracking-wider mb-2.5 sm:mb-3">
                    {b.category}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {b.desc}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200/70">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008BD7] group-hover:text-[#0076B8] transition-colors"
                  >
                    <span>Inquire {b.name} Systems</span>
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
