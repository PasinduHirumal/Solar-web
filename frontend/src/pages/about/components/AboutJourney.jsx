import React from "react";
import { Eye, Target, CheckCircle2, ShieldCheck, Sun, Zap, Award } from "lucide-react";

export default function AboutJourney() {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <span className="text-xs font-bold text-[#008BD7] uppercase tracking-widest bg-[#E6F1FA] px-3.5 py-1.5 rounded-full border border-[#008BD7]/30">
              Journey
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#031F4C] tracking-tight leading-tight">
              Our Journey Toward A Greener Future
            </h2>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              <strong className="text-[#031F4C]">Shree Energy (Pvt) Ltd</strong> is a leading solar energy solutions provider in Sri Lanka, dedicated to delivering reliable, efficient, and cost-effective renewable energy systems for residential, commercial, and industrial clients.
            </p>

            <p className="text-slate-600 text-xs sm:text-base leading-relaxed font-light">
              We are passionate about transforming the way Sri Lanka uses energy by promoting clean and sustainable solar power solutions that reduce electricity costs and support a greener future.
            </p>

            <p className="text-slate-600 text-xs sm:text-base leading-relaxed font-light">
              With a strong focus on quality and performance, we carefully select world-class solar panels, inverters, and equipment from trusted global manufacturers. Every system we design is tailored to maximize efficiency, long-term durability, and return on investment for our customers.
            </p>

            <p className="text-slate-600 text-xs sm:text-base leading-relaxed font-light">
              Our experienced team of engineers and technicians handle every step of the process — from consultation and system design to installation, monitoring, and after-sales support. We ensure every project is completed with high standards of safety, professionalism, and technical excellence.
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#EBF7E5] border border-[#63B723]/30 text-[#031F4C]">
              <p className="text-xs sm:text-sm font-semibold italic text-slate-800">
                “At Shree Energy, we believe solar power is not just an alternative — it is the future of energy in Sri Lanka. Our mission is to make that future accessible to everyone.”
              </p>
            </div>
          </div>

          {/* Right Column: Vision & Mission Cards */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* Vision Card */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F5F7FA] border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E6F1FA] text-[#008BD7] flex items-center justify-center mb-4 sm:mb-5 border border-[#008BD7]/20">
                <Eye size={26} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#031F4C] mb-2 sm:mb-3">
                Our Vision
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light">
                To become a leading solar energy solutions provider in Sri Lanka, driving the nation toward a sustainable, energy-independent future.
              </p>
            </div>

            {/* Mission Card */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F5F7FA] border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EBF7E5] text-[#63B723] flex items-center justify-center mb-4 sm:mb-5 border border-[#63B723]/20">
                <Target size={26} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#031F4C] mb-2 sm:mb-3">
                Our Mission
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light">
                To make renewable solar power accessible, affordable, and dependable for every Sri Lankan home and enterprise through engineering excellence and premier Tier-1 equipment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
