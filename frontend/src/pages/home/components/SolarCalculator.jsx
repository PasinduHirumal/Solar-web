import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Zap, Leaf, TreePine, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { currencyType } from "../../../lib/formatPrice";

export default function SolarCalculator() {
  const [monthlyUnits, setMonthlyUnits] = useState(350);
  const [ratePerUnit, setRatePerUnit] = useState(currencyType === "LKR" ? 50 : 0.22);

  // Solar calculations based on Sri Lanka meteorological irradiance (avg 4.3 peak sun hours/day)
  // 1 kWp system generates ~125 kWh / month in Sri Lanka
  const recommendedKw = Math.max(1, +(monthlyUnits / 125).toFixed(1));
  const panelCount = Math.ceil((recommendedKw * 1000) / 550); // 550W Monocrystalline bifacial panels
  const estimatedMonthlyGeneration = Math.round(recommendedKw * 125);
  const monthlySavings = Math.round(Math.min(monthlyUnits, estimatedMonthlyGeneration) * ratePerUnit);
  const annualSavings = monthlySavings * 12;
  const twentyFiveYearSavings = annualSavings * 25;
  const annualCo2Kg = Math.round(estimatedMonthlyGeneration * 12 * 0.78);
  const treesPlanted = Math.max(1, Math.round(annualCo2Kg / 22));

  const formatCurrency = (val) => {
    return `${currencyType} ${Number(val).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <section
      id="calculator"
      className="scroll-mt-24 sm:scroll-mt-32 py-16 sm:py-24 bg-gradient-to-b from-white via-[#F5F7FA] to-white relative overflow-hidden font-sans"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#008BD7]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF7E5] border border-[#63B723]/30 text-[#63B723] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#63B723]" />
            <span>Interactive Sri Lanka Solar ROI</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#031F4C] tracking-tight leading-tight">
            Calculate Your Solar Energy Savings
          </h2>
          <p className="text-slate-600 text-xs sm:text-base mt-2 sm:mt-3 font-normal leading-relaxed max-w-xl mx-auto">
            Discover your recommended solar kilowatt system capacity, estimated monthly electricity bill reduction, and environmental payback in seconds.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 p-4 sm:p-7 lg:p-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start lg:items-center">
            {/* Input Controls */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-7">
              {/* Monthly Units Slider */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <label htmlFor="units-slider" className="text-xs sm:text-sm font-bold text-[#031F4C]">
                    Monthly Electricity Consumption
                  </label>
                  <span className="self-start sm:self-auto px-3 py-1 bg-[#E6F1FA] text-[#008BD7] text-xs sm:text-sm font-extrabold rounded-lg sm:rounded-xl border border-[#008BD7]/30 whitespace-nowrap">
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
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#008BD7] focus:outline-none focus:ring-2 focus:ring-[#008BD7]/30"
                />
                {/* Responsive Slider Range Labels */}
                <div className="grid grid-cols-3 text-[10px] sm:text-[11px] text-slate-500 font-medium mt-2">
                  <span className="text-left">
                    80 kWh<span className="hidden sm:inline"> (Compact)</span>
                  </span>
                  <span className="text-center">
                    500 kWh<span className="hidden sm:inline"> (Medium)</span>
                  </span>
                  <span className="text-right">
                    1500+ kWh<span className="hidden sm:inline"> (Commercial)</span>
                  </span>
                </div>
              </div>

              {/* Tariff Selection */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-600">
                    Avg. Tariff ({currencyType}/kWh)
                  </label>
                  <span className="text-xs font-bold text-[#031F4C] whitespace-nowrap">
                    {ratePerUnit} {currencyType}
                  </span>
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
                      className={`py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        ratePerUnit === rate
                          ? "bg-[#008BD7] text-white border-[#008BD7] shadow-sm"
                          : "bg-[#F5F7FA] text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block sm:inline">{rate}</span>{" "}
                      <span className="text-[10px] sm:text-xs font-normal opacity-90 sm:opacity-100">
                        {currencyType}/kWh
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended System Specs Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] border border-slate-200/90 space-y-3">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recommended Shree Energy System Specs
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#E6F1FA] text-[#008BD7] flex items-center justify-center shrink-0">
                      <Zap size={19} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base sm:text-xl font-black text-[#031F4C] truncate">{recommendedKw} kWp</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">Array Capacity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#EBF7E5] text-[#63B723] flex items-center justify-center shrink-0">
                      <Sun size={19} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base sm:text-xl font-black text-[#031F4C] truncate">{panelCount} Panels</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">550W Tier-1 PV</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Card with Shree Energy Navy Palette */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#0F172B] via-[#031F4C] to-[#0F172B] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 relative overflow-hidden shadow-2xl border border-slate-800">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#008BD7]/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4 sm:space-y-6">
                <div>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#008BD7] block">
                    Estimated Annual Savings
                  </span>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-1 leading-tight break-words">
                    {formatCurrency(annualSavings)}
                    <span className="text-xs sm:text-sm font-normal text-slate-300 ml-1">/ year</span>
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                    Estimated monthly reduction: ~{formatCurrency(monthlySavings)}
                  </p>
                </div>

                <div className="pt-3.5 sm:pt-4 border-t border-slate-800 grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      25-Year Cumulative
                    </span>
                    <p className="text-base sm:text-xl font-black text-[#63B723] mt-0.5 truncate">
                      {formatCurrency(twentyFiveYearSavings)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Monthly Generation
                    </span>
                    <p className="text-base sm:text-xl font-black text-[#96D0FF] mt-0.5 truncate">
                      ~{estimatedMonthlyGeneration} kWh
                    </p>
                  </div>
                </div>

                {/* Eco Impact */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[11px] sm:text-xs font-bold text-[#63B723] flex items-center gap-1.5">
                    <Leaf size={14} className="shrink-0" />
                    Environmental Impact
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <TreePine size={14} className="text-[#63B723] shrink-0" />
                      <span>{treesPlanted} mature trees planted</span>
                    </span>
                    <span className="font-semibold text-white whitespace-nowrap">
                      {(annualCo2Kg / 1000).toFixed(1)}t CO₂/yr
                    </span>
                  </div>
                </div>

                {/* Direct Action */}
                <Link
                  to="/contact"
                  className="w-full py-3.5 sm:py-4 px-4 rounded-full bg-gradient-to-r from-[#008BD7] to-[#046bd2] hover:from-[#0076B8] hover:to-[#008BD7] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#008BD7]/30 transition-all hover:scale-[1.01] active:scale-[0.99] text-center"
                >
                  <span>Consult Our Solar Engineers</span>
                  <ArrowRight size={15} className="shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
