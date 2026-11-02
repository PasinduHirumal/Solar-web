import React, { useState } from "react";
import { ChevronDown, HelpCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { faqData } from "../../../data/dataset";

export default function SolarFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F5F7FA] border-t border-slate-200 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E6F1FA] border border-[#008BD7]/30 text-[#008BD7] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <HelpCircle size={15} />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#031F4C] tracking-tight leading-tight">
            Frequently Asked Solar Questions
          </h2>
          <p className="text-slate-600 text-xs sm:text-base mt-2 sm:mt-3 font-normal max-w-xl mx-auto leading-relaxed">
            Clear, transparent answers to help you navigate your journey toward clean solar independence.
          </p>
        </div>

        {/* Animated Accordion List */}
        <div className="space-y-3.5 sm:space-y-4">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.id}
                initial={false}
                animate={{
                  borderColor: isOpen ? "rgba(0, 139, 215, 0.4)" : "rgba(226, 232, 240, 1)",
                  boxShadow: isOpen
                    ? "0 10px 25px -5px rgba(0, 139, 215, 0.08), 0 8px 10px -6px rgba(0, 139, 215, 0.04)"
                    : "0 1px 3px 0 rgba(0, 0, 0, 0.02)",
                }}
                className="rounded-2xl border bg-white overflow-hidden transition-colors duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                  className="w-full px-4 py-4 sm:px-7 sm:py-5 text-left flex items-center justify-between gap-3 sm:gap-4 font-bold text-[#031F4C] hover:text-[#008BD7] transition-colors cursor-pointer group"
                >
                  <span className="text-sm sm:text-base md:text-lg leading-snug group-hover:translate-x-0.5 transition-transform">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? "bg-[#008BD7] text-white rotate-180 shadow-md shadow-[#008BD7]/25"
                        : "bg-slate-100 text-slate-500 group-hover:bg-[#E6F1FA] group-hover:text-[#008BD7]"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Open & Close Height/Opacity Animation */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
                          opacity: { duration: 0.25, delay: 0.1 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
                          opacity: { duration: 0.15 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 sm:px-7 sm:pb-6 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-light border-t border-slate-100 pt-3.5 sm:pt-4">
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <CheckCircle2 size={18} className="text-[#63B723] shrink-0 mt-0.5 hidden sm:block" />
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
