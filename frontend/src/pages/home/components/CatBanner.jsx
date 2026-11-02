import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PhoneCall } from "lucide-react";

export default function CatBanner() {
    return (
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
    )
}