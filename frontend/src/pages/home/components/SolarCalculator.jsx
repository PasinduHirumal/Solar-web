import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Zap, TrendingUp, Leaf, TreePine, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { currencyType } from "../../../lib/formatPrice";

export default function SolarCalculator() {
  const [monthlyUnits, setMonthlyUnits] = useState(350);
  const [ratePerUnit, setRatePerUnit] = useState(currencyType === "LKR" ? 50 : 0.22);

  // Solar calculations based on industry standards (avg 4.2 peak sun hours/day)
  // 1 kWp system generates ~125 kWh / month
  const recommendedKw = Math.max(1, +(monthlyUnits / 125).toFixed(1));
  const panelCount = Math.ceil((recommendedKw * 1000) / 550); // 550W Monocrystalline panels
  const estimatedMonthlyGeneration = Math.round(recommendedKw * 125);
  const monthlySavings = Math.round(Math.min(monthlyUnits, estimatedMonthlyGeneration) * ratePerUnit);
  const annualSavings = monthlySavings * 12;
  const twentyFiveYearSavings = annualSavings * 25;
  const annualCo2Kg = Math.round(estimatedMonthlyGeneration * 12 * 0.78); // 0.78 kg CO2 per kWh
  const treesPlanted = Math.max(1, Math.round(annualCo2Kg / 22)); // 22kg CO2 absorbed per tree/year

  const formatCurrency = (val) => {
    return `${currencyType} ${Number(val).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <section id="calculator" className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive ROI Estimation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Calculate Your Solar Energy Savings
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 font-normal leading-relaxed">
            Discover your recommended solar system capacity, estimated electricity bill reduction, and environmental impact in seconds.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="units-slider" className="text-sm font-bold text-slate-800">
                    Monthly Electricity Consumption
                  </label>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-extrabold rounded-lg border border-blue-200">
                    {monthlyUnits} kWh / month
                  </span>
                </div>
                <input
                  id="units-slider"
                  type="range"
                  min="80"
                  max="1500"
                  step="10"
                  value={monthlyUnits}
                  onChange={(e) => setMonthlyUnits(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-2">
                  <span>80 kWh (Compact home)</span>
                  <span>500 kWh</span>
                  <span>1500+ kWh (Commercial)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="rate-input" className="text-xs font-semibold text-slate-600">
                    Avg. Electricity Tariff ({currencyType} per kWh)
                  </label>
                  <span className="text-xs font-bold text-slate-700">{ratePerUnit} {currencyType}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    currencyType === "LKR" ? 35 : 0.15,
                    currencyType === "LKR" ? 50 : 0.22,
                    currencyType === "LKR" ? 75 : 0.32,
                  ].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setRatePerUnit(rate)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        ratePerUnit === rate
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {rate} {currencyType}/kWh
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizing Specifications Quick Pill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recommended System Specs
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                      <Zap size={20} />
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-slate-900">{recommendedKw} kWp</p>
                      <p className="text-xs text-slate-500">Array Capacity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                      <Sun size={20} />
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-slate-900">{panelCount} Panels</p>
                      <p className="text-xs text-slate-500">550W Tier-1 PV</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Estimated Annual Savings
                  </span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                    {formatCurrency(annualSavings)}
                    <span className="text-sm font-normal text-slate-300 ml-1">/ year</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Estimated monthly reduction: ~{formatCurrency(monthlySavings)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      25-Year Return
                    </span>
                    <p className="text-xl font-bold text-emerald-400 mt-0.5">
                      {formatCurrency(twentyFiveYearSavings)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Monthly Clean Power
                    </span>
                    <p className="text-xl font-bold text-blue-300 mt-0.5">
                      ~{estimatedMonthlyGeneration} kWh
                    </p>
                  </div>
                </div>

                {/* Eco Impact */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Leaf size={14} />
                    Environmental Dividend
                  </span>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <TreePine size={14} className="text-emerald-400" />
                      Equivalent to {treesPlanted} mature trees planted
                    </span>
                    <span className="font-semibold text-white">
                      {(annualCo2Kg / 1000).toFixed(1)}t CO₂/yr
                    </span>
                  </div>
                </div>

                {/* Direct Action */}
                <Link
                  to={`/contact?kw=${recommendedKw}&units=${monthlyUnits}`}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Request Engineering Quote for {recommendedKw} kWp</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
