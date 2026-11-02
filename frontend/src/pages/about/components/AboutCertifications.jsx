import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { certificationsData } from "../../../data/dataset";

export default function AboutCertifications() {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-bold text-[#008BD7] uppercase tracking-widest bg-[#E6F1FA] border border-[#008BD7]/30 px-3.5 py-1.5 rounded-full">
            International Standards
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#031F4C] mt-3 leading-tight">
            Accreditations & Certifications
          </h2>
          <p className="text-slate-600 text-xs sm:text-base mt-2 sm:mt-3 font-normal leading-relaxed">
            We never compromise on safety, equipment durability, or electrical code compliance for our clients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {certificationsData.map((c) => (
            <div
              key={c.code}
              className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F5F7FA] border border-slate-200/90 hover:border-[#008BD7]/50 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E6F1FA] text-[#008BD7] flex items-center justify-center mb-3 sm:mb-4">
                  <ShieldCheck size={20} className="sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-[#008BD7] block mb-1">
                  {c.code}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#031F4C] mb-1.5 sm:mb-2">{c.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">{c.desc}</p>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-[#63B723]">
                <CheckCircle2 size={13} />
                <span>Verified Compliance</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
