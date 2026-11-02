import React from "react";
import { Sun, Shield, Award } from "lucide-react";

export default function WhyChoosUs() {
    return (
        <section className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                        The SolarWeb Advantage
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                        Why Homeowners & Enterprises Trust Us
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base mt-2">
                        We provide Tier-1 certified equipment backed by industry-leading warranties and engineering support.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                            <Sun size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">High Efficiency Cells</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Our monocrystalline bifacial photovoltaic panels capture sunlight from both sides, maximizing output even during overcast mornings and late afternoons.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                            <Shield size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Intelligent Battery Storage</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            High-cycle life LiFePO4 batteries guarantee seamless power backup during grid outages, zero blackouts, and complete evening energy autonomy.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                            <Award size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">25-Year Certified Warranty</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Enjoy complete peace of mind with 25-year performance warranties, comprehensive equipment guarantees, and dedicated engineering maintenance.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}