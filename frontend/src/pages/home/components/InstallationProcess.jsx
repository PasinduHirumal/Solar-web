import React from "react";
import { Compass, PenTool, Wrench, Smartphone, CheckCircle2 } from "lucide-react";
import { engineeringStepsData } from "../../../data/dataset";

export default function InstallationProcess() {
  const iconMap = {
    "01": Compass,
    "02": PenTool,
    "03": Wrench,
    "04": Smartphone,
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-bold text-[#008BD7] uppercase tracking-widest bg-[#E6F1FA] px-3.5 py-1.5 rounded-full border border-[#008BD7]/30">
            Frictionless Process
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#031F4C] tracking-tight mt-3 leading-tight">
            How Shree Energy Works Planning To Powering Your Home
          </h2>
          <p className="text-slate-600 text-xs sm:text-base mt-2 sm:mt-3 font-normal leading-relaxed max-w-xl mx-auto">
            From initial consultation to clean power generation, our certified team handles every engineering and utility permitting phase seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {engineeringStepsData.map((step) => {
            const Icon = iconMap[step.number] || Compass;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-[#F5F7FA] border border-slate-200/90 hover:bg-white hover:shadow-xl hover:border-[#008BD7]/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-3xl font-black text-slate-300 group-hover:text-[#008BD7] transition-colors">
                      {step.number}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#63B723] bg-[#EBF7E5] px-2.5 py-0.5 rounded-full border border-[#63B723]/30">
                      {step.stepName}
                    </span>
                  </div>

                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white border border-slate-200 group-hover:bg-[#008BD7] text-[#008BD7] group-hover:text-white flex items-center justify-center mb-4 sm:mb-5 shadow-xs transition-all duration-300">
                    <Icon size={22} className="sm:w-6 sm:h-6" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#031F4C] mb-1.5 sm:mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200/70 flex items-center gap-1.5 text-xs font-semibold text-[#63B723]">
                  <CheckCircle2 size={14} />
                  <span>Certified Execution</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
