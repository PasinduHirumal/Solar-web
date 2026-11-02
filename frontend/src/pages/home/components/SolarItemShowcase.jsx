import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Package, Zap, ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { axiosInstance } from "../../../lib/axiosInstance";
import { formatPrice } from "../../../lib/formatPrice";
import ItemQuickViewModal from "./ItemQuickViewModal";

export default function SolarItemShowcase() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [catsRes, itemsRes] = await Promise.all([
          axiosInstance.get("/categories", { params: { is_active: true, limit: 20 } }).catch(() => null),
          axiosInstance.get("/items", { params: { is_active: true, limit: 30 } }).catch(() => null),
        ]);

        if (active) {
          const catsData = catsRes?.data?.data?.items || catsRes?.data?.items || [];
          const itemsData = itemsRes?.data?.data?.items || itemsRes?.data?.items || [];
          setCategories(catsData);
          setItems(itemsData);
        }
      } catch (err) {
        console.error("Failed to load solar equipment showcase:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      if (cat?.id) map[cat.id] = cat.title;
    });
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        item.category_id === selectedCategory ||
        item.category?.id === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.code?.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <section id="hardware-showcase" className="scroll-mt-24 sm:scroll-mt-32 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#008BD7] uppercase tracking-wider mb-2">
            <Zap size={15} />
            <span>Certified Solar Hardware Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#031F4C] tracking-tight leading-tight">
            Premium Solar Products
          </h2>
          <p className="text-slate-600 text-xs sm:text-base mt-2 max-w-2xl font-normal leading-relaxed">
            Engineered for high energy conversion yield, tropical climate endurance, and supported with up to 25-year manufacturer performance warranties.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search panels, batteries, inverters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008BD7]/20 focus:border-[#008BD7] shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* Category filter pills - smooth touch scrolling */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 custom-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
            selectedCategory === "all"
              ? "bg-[#008BD7] text-white border-[#008BD7] shadow-md shadow-[#008BD7]/20"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          All Equipment ({items.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? "bg-[#008BD7] text-white border-[#008BD7] shadow-md shadow-[#008BD7]/20"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Grid Container */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200 animate-pulse space-y-4">
              <div className="w-full aspect-video bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No Hardware Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {searchQuery
              ? `No equipment matching "${searchQuery}". Try another keyword.`
              : "New certified hardware items will be uploaded soon. Contact us for custom sourcing."}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 mt-4 sm:mt-5 px-5 py-2.5 rounded-full bg-[#E6F1FA] text-[#008BD7] text-xs font-bold hover:bg-[#d6e9f8] transition-colors"
          >
            <span>Inquire for Custom Equipment</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const catTitle = item.category?.title || categoryMap[item.category_id] || "Solar Hardware";
            const hasDiscount =
              item.marked_price &&
              item.selling_price &&
              Number(item.marked_price) > Number(item.selling_price);

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-[#008BD7]/50 p-4 sm:p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Hardware Visual Card */}
                  <div className="w-full aspect-[4/3] rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 via-[#E6F1FA]/40 to-slate-100 border border-slate-200/80 overflow-hidden relative flex flex-col items-center justify-center mb-3 sm:mb-4 p-4 sm:p-6 transition-all group-hover:border-[#008BD7]/40">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md shadow-[#008BD7]/10 border border-[#008BD7]/20 flex items-center justify-center text-[#008BD7] mb-2 transition-transform duration-300 group-hover:scale-110">
                      <Package size={28} className="sm:w-8 sm:h-8 stroke-[1.75]" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      Shree Energy Certified
                    </span>

                    {hasDiscount && (
                      <div className="absolute top-3 left-3 bg-[#63B723] text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                        SPECIAL OFFER
                      </div>
                    )}

                    {/* Quick View Button overlay */}
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="absolute inset-0 bg-[#031F4C]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
                    >
                      <Eye size={16} />
                      <span>Quick View</span>
                    </button>
                  </div>

                  {/* Category & SKU */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#008BD7] bg-[#E6F1FA] px-2.5 py-0.5 rounded-full truncate">
                      {catTitle}
                    </span>
                    {item.code && (
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[100px] sm:max-w-[120px]">
                        {item.code}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setSelectedItem(item)}
                    className="text-sm sm:text-base font-bold text-[#031F4C] group-hover:text-[#008BD7] transition-colors line-clamp-2 cursor-pointer leading-snug mb-1.5 sm:mb-2"
                  >
                    {item.title}
                  </h3>

                  {/* Short description */}
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 font-light leading-relaxed mb-3">
                      {item.description.replace(/<[^>]*>/g, "")}
                    </p>
                  )}

                  {/* Warranty Badge */}
                  {item.warranty_period && (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-[#63B723] bg-[#EBF7E5] px-2.5 py-0.5 rounded-lg w-fit mb-3 border border-[#63B723]/30">
                      <ShieldCheck size={12} className="text-[#63B723] shrink-0" />
                      <span>{item.warranty_period} Warranty</span>
                    </div>
                  )}
                </div>

                {/* Footer Price & Action */}
                <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block font-medium">Price</span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-base font-extrabold text-[#031F4C]">
                        {formatPrice(item.selling_price || item.marked_price || 0)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] sm:text-xs line-through text-slate-400">
                          {formatPrice(item.marked_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-50 group-hover:bg-[#008BD7] text-slate-700 group-hover:text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                  >
                    <span>Details</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Quick View */}
      {selectedItem && (
        <ItemQuickViewModal
          item={selectedItem}
          categoryName={selectedItem.category?.title || categoryMap[selectedItem.category_id]}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  );
}
