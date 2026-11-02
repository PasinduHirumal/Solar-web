import React from "react";
import { UserCheck, Zap, Layers, DollarSign, CheckCircle2 } from "lucide-react";
import { whyChooseUsData } from "../../../data/dataset";

export default function WhyChoosUs() {
  const iconMap = {
    engineers: UserCheck,
    efficiency: Zap,
    solutions: Layers,
    pricing: DollarSign,
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F5F7FA] border-t border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-bold text-[#63B723] uppercase tracking-widest bg-[#EBF7E5] px-3.5 py-1.5 rounded-full border border-[#63B723]/30">
            The Shree Energy Advantage
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#031F4C] tracking-tight mt-3 leading-tight">
            Eco-Friendly Doesn't Have To Be Complicated
          </h2>
          <p className="text-slate-600 text-xs sm:text-base mt-2 sm:mt-3 font-normal leading-relaxed">
            We provide Tier-1 certified equipment backed by industry-leading warranties, transparent guidance, and dedicated engineering care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {whyChooseUsData.map((f) => {
            const Icon = iconMap[f.id] || UserCheck;
            return (
              <div
                key={f.title}
                className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-[#008BD7]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border ${f.color}`}>
                    <Icon size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#031F4C] mb-2 sm:mb-3 leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#63B723]">
                  <CheckCircle2 size={15} />
                  <span>Quality Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
