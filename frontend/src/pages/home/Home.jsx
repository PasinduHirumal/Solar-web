import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Shield, Zap, ArrowRight, FolderTree, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { axiosInstance } from "../../lib/axiosInstance";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const fetchActiveCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories", {
          params: { is_active: true, limit: 6, sort_by: "created_at", sort_order: "DESC" },
        });
        const data = res.data?.data || res.data;
        setCategories(data.items || []);
      } catch (err) {
        console.error("Failed to fetch public categories:", err);
      } finally {
        setLoadingCats(false);
      }
    };

    fetchActiveCategories();
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-400/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>Clean & Sustainable Solar Energy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight md:leading-none">
            Empowering Your Tomorrow with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Solar Power
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed font-light">
            High-efficiency solar cells, advanced energy storage batteries, and complete renewable energy systems for homes and businesses.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Get Free Consultation</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              className="px-8 py-3.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              About Our Technology
            </Link>
          </div>

          {/* Highlights Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/60">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl md:text-3xl font-extrabold text-blue-600">25+ Yrs</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Solar Panel Lifespan</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl md:text-3xl font-extrabold text-blue-600">98.5%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Inverter Efficiency</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl md:text-3xl font-extrabold text-blue-600">Zero</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Carbon Emissions</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl md:text-3xl font-extrabold text-blue-600">24/7</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Support & Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* HARDWARE CATEGORIES SECTION (Connected to Backend /categories) */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <FolderTree size={16} />
              <span>Hardware Collections</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Featured Solar Hardware Categories
            </h2>
          </div>
          <Link
            to="/contact"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>Inquire about items</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loadingCats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-3xl p-6 border border-slate-200 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl mb-4" />
                <div className="h-5 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Sun className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-slate-800 font-semibold">Collections Updating</p>
            <p className="text-slate-500 text-sm mt-1">Check back soon for new solar product categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <Zap size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-light leading-relaxed">
                    {cat.description || "Certified solar energy hardware and components engineered for peak performance."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Verified Equipment
                  </span>
                  <Link
                    to="/contact"
                    className="text-xs font-bold text-slate-700 group-hover:text-blue-600 flex items-center gap-1 transition-colors"
                  >
                    <span>Request Quote</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Why Choose Solar Web?
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              We provide Tier-1 certified equipment backed by industry-leading warranties and engineering support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <Sun size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">High Efficiency Cells</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our solar photovoltaic panels capture maximum sunlight even in low-light conditions, delivering optimal kWh output.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Intelligent Battery Storage</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                High-cycle life lithium batteries guarantee seamless backup power during grid outages and peak demand times.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Certified Warranty</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Enjoy complete peace of mind with 25-year performance warranties and certified technical maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
