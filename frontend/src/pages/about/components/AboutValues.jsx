import React from "react";
import { ShieldCheck, Cpu, Leaf, Headphones, CheckCircle2 } from "lucide-react";
import { aboutValuesData } from "../../../data/dataset";

export default function AboutValues() {
  const iconList = [Cpu, ShieldCheck, Leaf, Headphones];

  return (
    <section className="py-16 sm:py-24 bg-[#F5F7FA] border-t border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-bold text-[#63B723] uppercase tracking-widest bg-[#EBF7E5] px-3.5 py-1.5 rounded-full border border-[#63B723]/30">
            Our Guiding Pillars
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#031F4C] tracking-tight mt-3 leading-tight">
            Built on Scientific Precision & Integrity
          </h2>
          <p className="text-slate-600 text-xs sm:text-base mt-2 sm:mt-3 font-normal leading-relaxed">
            Engineered from the ground up to deliver maximum renewable kilowatt-hours for decades to come.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {aboutValuesData.map((v, i) => {
            const Icon = iconList[i] || Cpu;
            return (
              <div
                key={v.title}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl ${v.color} flex items-center justify-center mb-4 sm:mb-5`}>
                    <Icon size={24} className="sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#031F4C] mb-1.5 sm:mb-2 leading-snug">
                    {v.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {v.desc}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#63B723]">
                  <CheckCircle2 size={14} />
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
