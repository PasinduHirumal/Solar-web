import { Link } from "react-router-dom";

export default function CtaSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to start your journey?</h2>
        <p className="text-xl text-slate-600 mb-10">Join us and take the first step toward building your online career today.</p>
        <Link to="/courses" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
          Explore Courses
        </Link>
      </div>
    </section>
  );
}
