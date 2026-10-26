import { Send } from "lucide-react";

export default function ContactForm() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h3>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Your Name</label>
            <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
            <input type="email" placeholder="john@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 ml-1">Subject</label>
          <input type="text" placeholder="How can we help?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 ml-1">Message</label>
          <textarea rows="5" placeholder="Your message here..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"></textarea>
        </div>
        <button type="submit" className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 group w-full md:w-auto">
          Send Message <Send size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
}
