import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function SolarFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How does Net Metering work and do I get credit for excess electricity?",
      a: "With Net Metering, any surplus electricity your solar panels produce during sunny peak hours is exported back to the national electrical grid. Your bidirectional utility meter spins backward, accumulating energy credits that automatically offset your nighttime or rainy day consumption.",
    },
    {
      q: "What happens during heavy rains, cloudy days, or nighttime?",
      a: "Solar PV panels continue generating electricity even on overcast days by harvesting diffused ambient UV rays, typically producing 25%–40% of their rated output. For nighttime or grid power outages, our hybrid battery storage (BESS) solutions kick in within 10 milliseconds to keep critical home and business circuits running continuously.",
    },
    {
      q: "What warranty coverage is included with Solar Web systems?",
      a: "All solar panels installed by Solar Web come with a 25-Year Linear Power Output Warranty guaranteeing at least 84.8% performance at Year 25, alongside a 12-Year Product Workmanship Warranty. Inverters feature 5 to 10-year manufacturer replacement warranties, and our LiFePO4 batteries carry 10-year / 6,000-cycle guarantees.",
    },
    {
      q: "How long does a standard rooftop installation take?",
      a: "For residential rooftop arrays (3kW – 15kW), the physical roof mounting and electrical wiring is completed within 2 to 3 days. Utility interconnection inspections, bidirectional net meter installation, and commissioning usually take 7 to 14 business days depending on local power utility approval timelines.",
    },
    {
      q: "What maintenance is required for solar photovoltaic systems?",
      a: "Solar panels have zero moving mechanical parts and require minimal maintenance. Rinsing dust or debris off the glass surface every 2 to 3 months ensures peak sunlight absorption. We also provide companion smartphone monitoring so you can track real-time yield and receive automatic maintenance alerts.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle size={15} />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Solar Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 font-light">
            Clear, transparent answers to help you navigate your journey toward energy independence.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-blue-50 text-blue-600" : "text-slate-500"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-slate-600 leading-relaxed font-light border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
