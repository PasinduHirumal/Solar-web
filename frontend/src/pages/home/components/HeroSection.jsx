import React from "react";
import { ArrowRight, Calculator } from "lucide-react";

export default function HeroSection() {

    const scrollToCalculator = () => {
        const el = document.getElementById("calculator");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    const scrollToHardware = () => {
        const el = document.getElementById("hardware-showcase");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-400/15 via-cyan-300/10 to-transparent blur-3xl pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-blue-200/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm backdrop-blur-md">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>Sustainable Energy Systems • Tier-1 Certified</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.1] md:leading-[1.1]">
                    Powering Your Future with{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700">
                        Clean Solar Energy
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed font-light">
                    Engineered high-efficiency photovoltaic panels, uninterrupted battery storage, and complete turnkey solar installations for residential and commercial independence.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={scrollToCalculator}
                        className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                    >
                        <Calculator size={18} />
                        <span>Calculate Solar Savings</span>
                    </button>

                    <button
                        type="button"
                        onClick={scrollToHardware}
                        className="px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                        <span>Explore Equipment</span>
                        <ArrowRight size={16} />
                    </button>
                </div>

                {/* Highlights Row */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/70">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <p className="text-2xl md:text-3xl font-extrabold text-blue-600">25+ Yrs</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Linear Power Warranty</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <p className="text-2xl md:text-3xl font-extrabold text-blue-600">98.5%</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Peak Inverter Efficiency</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <p className="text-2xl md:text-3xl font-extrabold text-blue-600">0%</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Blackout Interruption</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <p className="text-2xl md:text-3xl font-extrabold text-blue-600">24/7</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Smart Cloud Telemetry</p>
                    </div>
                </div>
            </div>
        </section>
    )
}