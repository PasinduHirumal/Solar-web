import React from "react";
import { ShieldCheck, Cpu, Leaf, Headphones, CheckCircle2 } from "lucide-react";

export default function AboutValues() {
  const values = [
    {
      title: "Tier-1 Engineering Rigor",
      desc: "We exclusively source photovoltaic modules and power electronics from globally certified Tier-1 manufacturers, ensuring highest conversion efficiency.",
      icon: Cpu,
    },
    {
      title: "Uncompromising Reliability",
      desc: "Every installation undergoes rigorous thermal imaging, ground-resistance testing, and electrical safety certification before grid synchronisation.",
      icon: ShieldCheck,
    },
    {
      title: "Genuine Ecological Impact",
      desc: "Our installations have cumulatively displaced over 15,000 metric tons of carbon dioxide, driving real national progress toward net-zero targets.",
      icon: Leaf,
    },
    {
      title: "Lifetime Client Partnership",
      desc: "We don't disappear after installation. Our dedicated technical operations center provides ongoing monitoring, quarterly health checks, and swift warranty handling.",
      icon: Headphones,
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Our Guiding Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Built on Scientific Precision & Integrity
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 font-light">
            Engineered from the ground up to deliver maximum renewable kilowatt-hours for decades to come.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light">{v.desc}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 size={13} />
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
