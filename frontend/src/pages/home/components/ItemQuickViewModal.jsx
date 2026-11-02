import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ShieldCheck, Zap, MessageCircle, ArrowRight, CheckCircle2, Tag } from "lucide-react";
import { formatPrice } from "../../../lib/formatPrice";
import { contactDetails } from "../../../data/dataset";

export default function ItemQuickViewModal({ item, categoryName, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const whatsappNumber = contactDetails.whatsapp.clean;
  const waMessage = encodeURIComponent(
    `Hello Shree Energy! I am interested in inquiring about "${item.title}" (Code: ${item.code || "N/A"}). Please share availability and current pricing details.`
  );
  const waLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  const hasDiscount = item.marked_price && item.selling_price && Number(item.marked_price) > Number(item.selling_price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(item.marked_price) - Number(item.selling_price)) / Number(item.marked_price)) * 100)
    : 0;

  const cleanWarrantyPeriod = item.warranty_period
    ? (/warranty/i.test(item.warranty_period)
        ? `${item.warranty_period} Official Coverage`
        : `${item.warranty_period} Official Warranty`)
    : "25-Year Manufacturer Linear Power Warranty";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden relative flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={17} />
        </button>

        <div className="overflow-y-auto p-5 sm:p-7 space-y-5 overscroll-contain">
          {/* Header Metadata */}
          <div className="pr-10 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#E6F1FA] text-[#008BD7] border border-[#008BD7]/20">
                {categoryName || "Solar Energy System"}
              </span>
              {hasDiscount && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#63B723] text-white shadow-2xs">
                  <Tag size={11} />
                  <span>{discountPercent}% OFF</span>
                </span>
              )}
              {item.code && (
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                  SKU: {item.code}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#031F4C] leading-snug">
              {item.title}
            </h3>
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Pricing Details
              </span>
              <div className="flex items-baseline gap-2.5 mt-0.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#031F4C]">
                  {formatPrice(item.selling_price || item.marked_price || 0)}
                </span>
                {hasDiscount && (
                  <span className="text-sm sm:text-base line-through text-slate-400 font-medium">
                    {formatPrice(item.marked_price)}
                  </span>
                )}
              </div>
            </div>
            {hasDiscount && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full">
                Save {formatPrice(Number(item.marked_price) - Number(item.selling_price))}
              </span>
            )}
          </div>

          {/* Key Specifications & Guarantees */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Specifications & Warranty
            </span>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block">
                  {cleanWarrantyPeriod}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {item.warranty_details || "3-year replacement warranty on PCB and electronic components."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E6F1FA] text-[#008BD7] flex items-center justify-center shrink-0">
                  <Zap size={15} />
                </div>
                <span className="text-xs font-medium text-slate-700">Anti-PID High Efficiency</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={15} />
                </div>
                <span className="text-xs font-medium text-slate-700">IEC 61215 & IEC 61730 Compliant</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {item.description && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-[#031F4C] uppercase tracking-wider">
                Technical Description
              </h4>
              <div
                className="text-xs sm:text-sm text-slate-600 leading-relaxed rich-text-rendered max-h-48 overflow-y-auto pr-2 custom-scrollbar bg-slate-50/50 p-3.5 rounded-xl border border-slate-100"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 rounded-full bg-[#63B723] hover:bg-[#549E1E] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#63B723]/20 hover:shadow-lg cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>Inquire on WhatsApp</span>
            </a>
            <Link
              to="/contact"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#008BD7] to-[#046bd2] hover:from-[#0076B8] hover:to-[#008BD7] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#008BD7]/20 hover:shadow-lg cursor-pointer"
            >
              <span>Contact Shree Energy</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
