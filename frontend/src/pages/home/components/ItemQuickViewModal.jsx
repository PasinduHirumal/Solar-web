import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Package, ShieldCheck, Zap, MessageCircle, ArrowRight, CheckCircle2, Tag } from "lucide-react";
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden relative flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={17} />
        </button>

        <div className="overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6 overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
            {/* Hardware Visual & Certification Badge */}
            <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-slate-50 via-[#E6F1FA]/60 to-slate-100 border border-slate-200 overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 text-center relative shadow-inner">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg shadow-[#008BD7]/10 border border-[#008BD7]/20 flex items-center justify-center text-[#008BD7] mb-2 sm:mb-3">
                <Package size={34} className="stroke-[1.75]" />
              </div>
              <span className="text-xs font-black text-[#031F4C] uppercase tracking-wider">
                Shree Energy Tier-1 Hardware
              </span>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 max-w-[200px]">
                Engineered for maximum photovoltaic yield & long durability
              </p>

              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-[#63B723] text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Tag size={12} />
                  <span>{discountPercent}% OFF</span>
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#E6F1FA] text-[#008BD7] border border-[#008BD7]/30 mb-1.5 sm:mb-2">
                  {categoryName || "Solar Energy System"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#031F4C] leading-snug">
                  {item.title}
                </h3>
                {item.code && (
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    SKU: {item.code}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F5F7FA] border border-slate-200/80">
                <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5 font-medium">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#031F4C]">
                    {formatPrice(item.selling_price || item.marked_price || 0)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs sm:text-sm line-through text-slate-400">
                      {formatPrice(item.marked_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[#63B723] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">
                      {item.warranty_period
                        ? `${item.warranty_period} Official Warranty`
                        : "25-Year Manufacturer Linear Power Warranty"}
                    </span>
                    {item.warranty_details && (
                      <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                        {item.warranty_details}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-[#008BD7] shrink-0" />
                  <span>High-efficiency cells with Anti-PID protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#63B723] shrink-0" />
                  <span>Compliant with IEC 61215 & IEC 61730 standards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {item.description && (
            <div className="pt-3 sm:pt-4 border-t border-slate-100">
              <h4 className="text-xs sm:text-sm font-bold text-[#031F4C] mb-1.5 sm:mb-2">Technical Description</h4>
              <div
                className="text-xs sm:text-sm text-slate-600 leading-relaxed rich-text-rendered"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 rounded-full bg-[#63B723] hover:bg-[#549E1E] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#63B723]/20"
            >
              <MessageCircle size={16} />
              <span>Inquire on WhatsApp</span>
            </a>
            <Link
              to="/contact"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#008BD7] to-[#046bd2] hover:from-[#0076B8] hover:to-[#008BD7] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#008BD7]/20"
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
