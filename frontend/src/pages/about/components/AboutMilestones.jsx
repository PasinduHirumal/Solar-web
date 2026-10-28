import React from "react";
import { Award, Zap, Building, Globe } from "lucide-react";

export default function AboutMilestones() {
  const milestones = [
    {
      year: "2018",
      title: "Company Founded",
      desc: "Solar Web was established by a team of certified renewable energy engineers with a mission to accelerate clean energy transition.",
      icon: Zap,
    },
    {
      year: "2020",
      title: "10 MW Deployed",
      desc: "Crossed 10 megawatts of cumulative rooftop solar installations across residential neighborhoods and industrial parks.",
      icon: Building,
    },
    {
      year: "2023",
      title: "Advanced BESS Integration",
      desc: "Pioneered high-voltage LiFePO4 battery storage integrations offering 100% blackout immunity during grid downtime.",
      icon: Award,
    },
    {
      year: "2026",
      title: "50+ MW & Smart App Telemetry",
      desc: "Surpassed 50 MW total capacity, deploying AI-driven cloud monitoring and real-time smart inverter diagnostics.",
      icon: Globe,
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Proven Track Record
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Milestones of Sustainable Growth
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 font-light">
            Continuous technical innovation and trusted clean energy delivery across eight years.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.year}
                className="relative rounded-3xl p-6 bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-blue-600">{m.year}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{m.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
