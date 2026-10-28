import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sun, Shield, Zap, ArrowRight, FolderTree, Award, CheckCircle2, Calculator, PhoneCall,
} from "lucide-react";
import { axiosInstance } from "../../lib/axiosInstance";
import SolarCalculator from "./components/SolarCalculator";
import SolarItemShowcase from "./components/SolarItemShowcase";
import SolarSolutionsGrid from "./components/SolarSolutionsGrid";
import InstallationProcess from "./components/InstallationProcess";
import SolarFaq from "./components/SolarFaq";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchActiveCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories", {
          params: { is_active: true, limit: 6, sort_by: "created_at", sort_order: "DESC" },
        });
        if (active) {
          const data = res.data?.data || res.data;
          setCategories(data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch public categories:", err);
      } finally {
        if (active) setLoadingCats(false);
      }
    };

    fetchActiveCategories();

    return () => {
      active = false;
    };
  }, []);

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
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* HERO SECTION */}
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

      {/* INTERACTIVE SOLAR CALCULATOR */}
      <SolarCalculator />

      {/* HARDWARE CATALOG SHOWCASE (Directly connected to /items) */}
      <SolarItemShowcase />

      {/* SOLAR SOLUTIONS BENTO GRID */}
      <SolarSolutionsGrid />

      {/* 4-STEP INSTALLATION JOURNEY */}
      <InstallationProcess />

      {/* WHY CHOOSE SOLAR WEB */}
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

      {/* FAQS SECTION */}
      <SolarFaq />

      {/* FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Ready to Take Control of Your Energy Bill?
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-light mb-8">
            Speak directly with our solar engineers. We'll conduct a free satellite roof assessment and give you an exact system sizing estimate.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 rounded-full bg-white text-blue-700 font-extrabold text-sm hover:bg-blue-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Get Free Site Consultation</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href={`https://wa.me/${(import.meta.env.VITE_APP_WHATSAPP_NUMBER || "+94741234567").replace(/\+/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-full bg-blue-800/60 border border-white/20 text-white font-bold text-sm hover:bg-blue-800 transition-all flex items-center gap-2"
            >
              <PhoneCall size={16} />
              <span>Talk to an Engineer</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
