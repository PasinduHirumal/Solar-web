import React from "react";
import { motion } from "framer-motion";
import ContactInfo from "./components/ContactInfo";
import ContactHero from "./components/ContactHero";
import { Navigation } from "lucide-react";

export default function Contact() {
  return (
    <div className="w-full bg-[#F5F7FA] font-sans min-h-screen">
      <ContactHero />

      {/* Contact Card Section */}
      <section className="pb-20 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ContactInfo />
          </motion.div>

          {/* Interactive Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-12 sm:mt-16 max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#008BD7] uppercase tracking-wider block mb-1">
                  Location & Map
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#031F4C]">
                  Shree Energy Colombo Headquarters
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Colombo, Western Province, Sri Lanka
                </p>
              </div>

              <a
                href="https://maps.google.com/?q=Colombo,+Sri+Lanka"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E6F1FA] text-[#008BD7] hover:bg-[#008BD7] hover:text-white font-bold text-xs uppercase tracking-wider transition-all w-fit"
              >
                <Navigation size={14} />
                <span>Get Directions</span>
              </a>
            </div>

            <div className="w-full h-72 sm:h-88 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
              <iframe
                title="Shree Energy Colombo Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.58586018151!2d79.7861642875102!3d6.921938634833214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[15%] contrast-[105%]"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
