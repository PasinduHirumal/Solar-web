import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Package, ShieldCheck, Zap, MessageCircle, ArrowRight, CheckCircle2, Tag } from "lucide-react";
import { formatPrice } from "../../../lib/formatPrice";

export default function ItemQuickViewModal({ item, categoryName, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const whatsappNumber = import.meta.env.VITE_APP_WHATSAPP_NUMBER || "+94741234567";
  const cleanNumber = whatsappNumber.replace(/\+/g, "");
  const waMessage = encodeURIComponent(
    `Hello Solar Web! I am interested in inquiring about "${item.title}" (Code: ${item.code || "N/A"}). Please share availability and current pricing details.`
  );
  const waLink = `https://wa.me/${cleanNumber}?text=${waMessage}`;

  const hasDiscount = item.marked_price && item.selling_price && Number(item.marked_price) > Number(item.selling_price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(item.marked_price) - Number(item.selling_price)) / Number(item.marked_price)) * 100)
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Preview */}
            <div className="w-full aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
              {item.picture?.url ? (
                <img
                  src={item.picture.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Package size={48} className="stroke-[1.5] mb-2 text-blue-500" />
                  <span className="text-xs font-semibold">Tier-1 Certified Hardware</span>
                </div>
              )}

              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Tag size={12} />
                  <span>{discountPercent}% OFF</span>
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
                  {categoryName || "Solar Energy System"}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                {item.code && (
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    SKU: {item.code}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 block mb-0.5 font-medium">Verified Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {formatPrice(item.selling_price || item.marked_price || 0)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm line-through text-slate-400">
                      {formatPrice(item.marked_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>25-Year Manufacturer Linear Power Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-amber-500 shrink-0" />
                  <span>High-efficiency cells with Anti-PID protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-blue-500 shrink-0" />
                  <span>Compliant with IEC 61215 & IEC 61730 standards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {item.description && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Technical Description</h4>
              <div
                className="text-sm text-slate-600 leading-relaxed rich-text-rendered"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-emerald-500/20"
            >
              <MessageCircle size={18} />
              <span>Inquire on WhatsApp</span>
            </a>
            <Link
              to={`/contact?subject=${encodeURIComponent(`Inquiry for ${item.title}`)}`}
              onClick={onClose}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-500/20"
            >
              <span>Request Formal Quote</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
