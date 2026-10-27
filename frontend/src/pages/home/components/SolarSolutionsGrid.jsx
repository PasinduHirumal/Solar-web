import React from "react";
import { Link } from "react-router-dom";
import { Home, Building2, BatteryCharging, Factory, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

export default function SolarSolutionsGrid() {
  const solutions = [
    {
      title: "Residential Rooftop Systems",
      subtitle: "Grid-Tied & Net Metered",
      desc: "Turn your rooftop into a clean energy power plant. Slash your monthly electricity bills by up to 90% with Tier-1 bifacial panels and smart micro-inverters.",
      icon: Home,
      tag: "Residential",
      metrics: "3 kW – 20 kW Arrays",
      link: "/contact?solution=residential",
      className: "md:col-span-8",
      accent: "from-blue-600/10 via-cyan-500/5 to-transparent",
    },
    {
      title: "Hybrid Battery Storage (BESS)",
      subtitle: "Uninterrupted 24/7 Power",
      desc: "High-voltage Lithium LiFePO4 batteries ensure total blackout immunity and nighttime power autonomy with 6,000+ cycle lifespan.",
      icon: BatteryCharging,
      tag: "Energy Storage",
      metrics: "10 kWh – 100+ kWh",
      link: "/contact?solution=storage",
      className: "md:col-span-4",
      accent: "from-amber-500/10 via-orange-500/5 to-transparent",
    },
    {
      title: "Commercial & Industrial Microgrids",
      subtitle: "Peak Shaving & Green Tariffs",
      desc: "Designed for manufacturing factories, warehouses, schools, and corporate campuses requiring rapid ROI and high kilowatt peak generation.",
      icon: Factory,
      tag: "Commercial C&I",
      metrics: "50 kW – 1+ MW Capacity",
      link: "/contact?solution=commercial",
      className: "md:col-span-4",
      accent: "from-emerald-500/10 via-teal-500/5 to-transparent",
    },
    {
      title: "EV Charging & Smart Carports",
      subtitle: "Solar Powered Mobility",
      desc: "Architecturally integrated solar parking canopies coupled with Level-2 and DC Fast Chargers to fuel your fleet with 100% free sunshine.",
      icon: Zap,
      tag: "Mobility & Carports",
      metrics: "Dual 22 kW AC / 60 kW DC",
      link: "/contact?solution=ev-carport",
      className: "md:col-span-8",
      accent: "from-indigo-600/10 via-purple-500/5 to-transparent",
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background ambient mesh */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles size={14} />
            <span>Turnkey Solar Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Engineered For Every Energy Scale
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3 font-light leading-relaxed">
            From single-phase residential villas to megawatt-scale industrial microgrids, our custom photovoltaic solutions maximize yield and reliability.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.title}
                className={`${sol.className} group relative rounded-3xl p-8 bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between`}
              >
                {/* Subtle gradient glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${sol.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                      <Icon size={24} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 bg-slate-700/60 px-3 py-1 rounded-full border border-slate-600/50">
                      {sol.tag}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    {sol.subtitle}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {sol.title}
                  </h3>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">
                    {sol.desc}
                  </p>
                </div>

                <div className="relative z-10 mt-8 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    {sol.metrics}
                  </span>
                  <Link
                    to={sol.link}
                    className="text-xs font-bold text-cyan-400 group-hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>Explore Solution</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
