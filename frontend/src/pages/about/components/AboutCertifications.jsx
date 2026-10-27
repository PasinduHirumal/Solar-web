import React from "react";
import { ShieldCheck, Award, CheckCircle2, FileCheck } from "lucide-react";

export default function AboutCertifications() {
  const certs = [
    {
      code: "BloombergNEF Tier-1",
      title: "Tier-1 Module Compliance",
      desc: "All installed solar panels are manufactured by Tier-1 vetted companies audited for top financial and structural longevity.",
    },
    {
      code: "IEC 61215 / 61730",
      title: "International Photovoltaic Standard",
      desc: "Modules withstand high wind loads (2400 Pa), heavy mechanical snow pressure (5400 Pa), and extreme tropical UV exposure.",
    },
    {
      code: "ISO 9001 & ISO 14001",
      title: "Quality & Environmental System",
      desc: "Adherence to rigorous international quality control and sustainable low-carbon manufacturing and disposal standards.",
    },
    {
      code: "CE & UL 1741",
      title: "Inverter Safety & Grid Codes",
      desc: "String and hybrid inverters feature rapid shutdown, arc fault circuit interrupters (AFCI), and anti-islanding grid protection.",
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
            International Standards
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
            Accreditations & Certifications
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 font-light">
            We never compromise on safety, equipment durability, or electrical code compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certs.map((c) => (
            <div
              key={c.code}
              className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">
                {c.code}
              </span>
              <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
