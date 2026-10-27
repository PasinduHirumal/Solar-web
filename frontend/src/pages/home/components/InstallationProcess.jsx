import React from "react";
import { Compass, FileCheck2, Wrench, Smartphone, CheckCircle2 } from "lucide-react";

export default function InstallationProcess() {
  const steps = [
    {
      number: "01",
      title: "Solar Irradiation Audit",
      desc: "Our engineering team conducts an aerial sun-path simulation, shade profiling, and structural roof inspection to calculate optimal panel placement.",
      icon: Compass,
      tag: "Day 1-2",
    },
    {
      number: "02",
      title: "Engineering & Utility Permits",
      desc: "We draft single-line electrical schematics, submit grid interconnection paperwork, and secure net-metering approvals with regulatory authorities.",
      icon: FileCheck2,
      tag: "Day 3-7",
    },
    {
      number: "03",
      title: "Certified Rapid Mounting",
      desc: "Licensed technicians install aluminum anodized mounting structures, high-efficiency solar panels, inverter arrays, and surge protectors.",
      icon: Wrench,
      tag: "Day 8-10",
    },
    {
      number: "04",
      title: "Cloud Telemetry & Energization",
      desc: "System energization, bidirectional net-meter testing, and smartphone IoT monitoring app setup for real-time kWh power tracking.",
      icon: Smartphone,
      tag: "Day 11+",
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Frictionless Deployment
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Our 4-Step Engineering Journey
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 font-light">
            From initial site consultation to permanent clean energy generation, we handle the entire engineering, utility permitting, and installation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-3xl p-6 bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-slate-300">
                      {step.number}
                    </span>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                      {step.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-blue-500/20">
                    <Icon size={22} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 size={13} />
                  <span>Quality Assurance Guaranteed</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
