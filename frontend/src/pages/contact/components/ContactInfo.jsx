import React, { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck, Check, Copy, ExternalLink } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { contactDetails } from "../../../data/dataset";
import toast from "react-hot-toast";

export default function ContactInfo() {
  const [copiedText, setCopiedText] = useState("");

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Main Executive Contact Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#008BD7]/10 via-[#63B723]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF7E5] text-[#63B723] text-xs font-bold uppercase tracking-wider mb-2 border border-[#63B723]/30">
                <span className="w-2 h-2 rounded-full bg-[#63B723] animate-pulse"></span>
                <span>Direct Assistance & Engineering Desk</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#031F4C] tracking-tight">
                Shree Energy Contact Details
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-light">
                Connect directly with our renewable energy engineering desk in Colombo, Sri Lanka.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#E6F1FA] text-[#008BD7] text-xs font-bold w-fit border border-[#008BD7]/20">
              <ShieldCheck size={16} />
              <span>Verified Direct Desk</span>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Phone Hotlines */}
            <div className="p-6 rounded-2xl bg-[#F5F7FA] border border-slate-200/80 hover:border-[#008BD7]/40 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F1FA] text-[#008BD7] flex items-center justify-center shrink-0 border border-[#008BD7]/20 shadow-2xs">
                  <Phone size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Direct Phone / Hotline
                  </span>
                  <div className="space-y-1">
                    {contactDetails.phones.map((p) => (
                      <div key={p.number} className="flex items-center justify-between gap-2">
                        <a
                          href={`tel:${p.number}`}
                          className="text-[#031F4C] hover:text-[#008BD7] font-extrabold text-base sm:text-lg transition-colors truncate"
                        >
                          {p.display}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(p.number, p.label)}
                          className="p-1.5 text-slate-400 hover:text-[#008BD7] hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Copy number"
                        >
                          {copiedText === p.label ? <Check size={14} className="text-[#63B723]" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200/60 font-light">
                Call for inquiries, project consultations, and technical support.
              </p>
            </div>

            {/* Email Addresses */}
            <div className="p-6 rounded-2xl bg-[#F5F7FA] border border-slate-200/80 hover:border-[#008BD7]/40 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F1FA] text-[#008BD7] flex items-center justify-center shrink-0 border border-[#008BD7]/20 shadow-2xs">
                  <Mail size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Email Inquiries
                  </span>
                  <div className="space-y-1">
                    {contactDetails.emails.map((e) => (
                      <div key={e.address} className="flex items-center justify-between gap-2">
                        <a
                          href={`mailto:${e.address}`}
                          className="text-[#031F4C] hover:text-[#008BD7] font-bold text-sm sm:text-base transition-colors truncate block"
                        >
                          {e.address}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(e.address, e.label)}
                          className="p-1.5 text-slate-400 hover:text-[#008BD7] hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Copy email"
                        >
                          {copiedText === e.label ? <Check size={14} className="text-[#63B723]" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200/60 font-light">
                Official inquiries, schematics review, and documentation.
              </p>
            </div>

            {/* Address */}
            <div className="p-6 rounded-2xl bg-[#F5F7FA] border border-slate-200/80 hover:border-[#63B723]/40 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF7E5] text-[#63B723] flex items-center justify-center shrink-0 border border-[#63B723]/20 shadow-2xs">
                  <MapPin size={22} />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Headquarters
                  </span>
                  <p className="text-[#031F4C] font-extrabold text-base sm:text-lg">
                    {contactDetails.address.street}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Western Province, Sri Lanka
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(contactDetails.address.mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008BD7] hover:text-[#0077b8] transition-colors"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Consultation Hours */}
            <div className="p-6 rounded-2xl bg-[#F5F7FA] border border-slate-200/80 hover:border-[#008BD7]/40 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                  <Clock size={22} className="text-[#008BD7]" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Operating & Consultation Hours
                  </span>
                  <p className="text-[#031F4C] font-bold text-sm sm:text-base">
                    {contactDetails.workingHours.weekdays}
                  </p>
                  <p className="text-xs font-semibold text-[#63B723] mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#63B723]"></span>
                    {contactDetails.workingHours.telemetry}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200/60 font-light">
                Sunday & Public Holidays: On-call emergency solar support.
              </p>
            </div>
          </div>

          {/* Quick WhatsApp Action Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#63B723] to-[#549E1E] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-[#63B723]/25">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <FaWhatsapp size={30} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black">
                  Instant WhatsApp Consultation
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 font-light mt-0.5">
                  Chat in real-time with an active solar specialist on WhatsApp.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${contactDetails.whatsapp.clean}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto shrink-0 px-8 py-3.5 rounded-full bg-white text-[#031F4C] hover:bg-slate-100 font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle size={18} className="text-[#63B723]" />
              <span>Chat Now</span>
            </a>
          </div>

          {/* Social Links Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Connect with Shree Energy on social media:</span>
            <div className="flex items-center gap-3">
              <a
                href={contactDetails.social.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-[#F5F7FA] hover:bg-[#008BD7] hover:text-white flex items-center justify-center transition-colors border border-slate-200 text-slate-700"
              >
                <FaFacebook size={16} />
              </a>
              <a
                href={`https://wa.me/${contactDetails.whatsapp.clean}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-xl bg-[#F5F7FA] hover:bg-[#63B723] hover:text-white flex items-center justify-center transition-colors border border-slate-200 text-slate-700"
              >
                <FaWhatsapp size={16} />
              </a>
              <a
                href={contactDetails.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-[#F5F7FA] hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors border border-slate-200 text-slate-700"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href={contactDetails.social.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-[#F5F7FA] hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors border border-slate-200 text-slate-700"
              >
                <FaYoutube size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
