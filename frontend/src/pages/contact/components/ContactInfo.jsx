import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function ContactInfo() {
  const phone = import.meta.env.VITE_APP_NUMBER;
  const whatsappNumber = import.meta.env.VITE_APP_WHATSAPP_NUMBER;
  const email = import.meta.env.VITE_APP_EMAIL;
  const address = import.meta.env.VITE_APP_ADDRESS;
  const waMeLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\+/g, '')}` : '#';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-500/30 transition-colors shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h3>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Phone className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Phone / WhatsApp</p>
            <p className="text-slate-900 font-medium text-lg">{phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Mail className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Email Address</p>
            <p className="text-slate-900 font-medium text-lg">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <MapPin className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Location</p>
            <p className="text-slate-900 font-medium text-lg whitespace-pre-line">{address}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-200">
        <a href={waMeLink} target="_blank" rel="noreferrer" className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <MessageCircle size={20} /> Message on WhatsApp
        </a>
      </div>
    </div>
  );
}
