import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Loader2, CheckCircle2, Phone, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactForm() {
  const [searchParams] = useSearchParams();
  const kwParam = searchParams.get("kw");
  const unitsParam = searchParams.get("units");
  const subjectParam = searchParams.get("subject");
  const solutionParam = searchParams.get("solution");

  const getInitialProjectType = (solution) => {
    if (solution === "storage") return "Battery Energy Storage (BESS)";
    if (solution === "commercial") return "Commercial Microgrid";
    if (solution === "ev-carport") return "EV Carport Solar";
    return "Residential Rooftop";
  };

  const [projectType, setProjectType] = useState(() => getInitialProjectType(solutionParam));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    systemSize: kwParam ? `${kwParam} kW` : "5 kW",
    subject: subjectParam || (unitsParam ? `Solar System Sizing (${unitsParam} kWh/month)` : ""),
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    setTimeout(() => {
      toast.success("Thank you! Your solar engineering request has been received.");
      setSubmitted(true);
      setSending(false);
    }, 700);
  };

  if (submitted) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Request Dispatched</h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
          Our solar engineering department will review your property requirements and reach out within 2 business hours with your preliminary solar design.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              systemSize: "5 kW",
              subject: "",
              message: "",
            });
          }}
          className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
          <Sparkles size={14} />
          <span>Engineering Assessment</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Request Free Consultation & Quote
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-light">
          Share your energy goals and our certified solar technicians will size the optimal array for your property.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Project Scope Chips */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Installation / System Scope
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              "Residential Rooftop",
              "Commercial Microgrid",
              "Battery Storage (BESS)",
              "Hardware Supply",
            ].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setProjectType(type)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                  projectType === type
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Your Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Michael Fernando"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. michael@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Phone / WhatsApp Number</label>
            <input
              type="tel"
              placeholder="e.g. +94 77 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Target Capacity</label>
            <select
              value={formData.systemSize}
              onChange={(e) => setFormData({ ...formData, systemSize: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors cursor-pointer"
            >
              <option value="3 kW">3 kW (Small Home / ~350 units)</option>
              <option value="5 kW">5 kW (Standard Home / ~600 units)</option>
              <option value="10 kW">10 kW (Large Residence / ~1200 units)</option>
              <option value="20 kW+">20 kW+ (Commercial / Factory)</option>
              <option value="Custom">Custom Sizing Required</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 ml-1">Subject</label>
          <input
            type="text"
            required
            placeholder="e.g. Rooftop solar quote or equipment inquiry"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 ml-1">Project Details & Roof Details</label>
          <textarea
            rows="4"
            required
            placeholder="Tell us about your property (e.g. Tile roof, Asbestos, Concrete slab), current monthly electricity expenditure, or battery backup needs..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 group w-full md:w-auto cursor-pointer disabled:opacity-50 shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
        >
          {sending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Analyzing & Submitting...</span>
            </>
          ) : (
            <>
              <span>Dispatch Solar Assessment Request</span>
              <Send size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
