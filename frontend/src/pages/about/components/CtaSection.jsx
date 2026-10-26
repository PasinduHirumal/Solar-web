import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white transition-colors duration-300 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Ready to transition to clean solar energy?
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Contact our solar engineering experts today for system sizing, quote requests, and sustainable power advice.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-base hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
        >
          <span>Contact Us Today</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
