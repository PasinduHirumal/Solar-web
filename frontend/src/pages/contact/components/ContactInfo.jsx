import React from "react";
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck } from "lucide-react";

export default function ContactInfo() {
  const phone = import.meta.env.VITE_APP_NUMBER || "+94741234567";
  const whatsappNumber = import.meta.env.VITE_APP_WHATSAPP_NUMBER || "+94741234567";
  const email = import.meta.env.VITE_APP_EMAIL || "info@example.com";
  const address = import.meta.env.VITE_APP_ADDRESS || "Colombo, Sri Lanka";
  const waMeLink = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-500/30 transition-colors shadow-sm space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">Contact Details</h3>
        <p className="text-xs text-slate-500">Reach out directly to our engineering desk.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 mt-1">
            <Phone size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5 font-medium">Direct Line</p>
            <p className="text-slate-900 font-bold text-base">{phone}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 mt-1">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5 font-medium">Email Inquiries</p>
            <p className="text-slate-900 font-bold text-base">{email}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 mt-1">
            <MapPin size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5 font-medium">Headquarters</p>
            <p className="text-slate-900 font-bold text-base whitespace-pre-line">{address}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 mt-1">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5 font-medium">Consultation Hours</p>
            <p className="text-slate-900 font-bold text-sm">Mon – Sat: 8:30 AM – 6:00 PM</p>
            <p className="text-[11px] text-slate-400 mt-0.5">24/7 Remote Monitoring for Active Arrays</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <a
          href={waMeLink}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
        >
          <MessageCircle size={19} />
          <span>Quick WhatsApp Chat</span>
        </a>
      </div>
    </div>
  );
}
