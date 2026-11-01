import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Package, Zap, ArrowRight, Eye, ShieldCheck, Tag, Sparkles } from "lucide-react";
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
    <section id="hardware-showcase" className="py-20 max-w-7xl mx-auto px-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
            <Zap size={16} />
            <span>Certified Hardware Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Solar Equipment & Systems
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl font-light">
            Engineered for high energy yield, harsh environmental durability, and certified with 25-year industry performance guarantees.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search panels, batteries, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
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
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Grid Container */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200 animate-pulse space-y-4">
              <div className="w-full aspect-video bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Hardware Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? `No equipment matching "${searchQuery}". Try a different keyword.`
              : "New certified hardware items will be uploaded soon. Contact us for custom sourcing."}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <span>Inquire for Custom Order</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const catTitle = item.category?.title || categoryMap[item.category_id] || "Solar Hardware";
            const hasDiscount =
              item.marked_price &&
              item.selling_price &&
              Number(item.marked_price) > Number(item.selling_price);

            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400/40 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Hardware Visual Card */}
                  <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 border border-slate-200/80 overflow-hidden relative flex flex-col items-center justify-center mb-4 p-6 transition-all group-hover:border-blue-400/50 group-hover:from-blue-50/60 group-hover:to-indigo-100/50">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md shadow-blue-500/10 border border-blue-100 flex items-center justify-center text-blue-600 mb-2 transition-transform duration-300 group-hover:scale-110">
                      <Package size={32} className="stroke-[1.75]" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wide uppercase text-slate-500">
                      Solar Web Certified
                    </span>

                    {hasDiscount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                        SPECIAL OFFER
                      </div>
                    )}

                    {/* Quick View Button overlay */}
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
                    >
                      <Eye size={16} />
                      <span>Quick View</span>
                    </button>
                  </div>

                  {/* Category & SKU */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {catTitle}
                    </span>
                    {item.code && (
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                        {item.code}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setSelectedItem(item)}
                    className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
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
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg w-fit mb-3 border border-emerald-200/60">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      <span>{item.warranty_period} Warranty</span>
                    </div>
                  )}
                </div>

                {/* Footer Price & Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Selling Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-slate-900">
                        {formatPrice(item.selling_price || item.marked_price || 0)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs line-through text-slate-400">
                          {formatPrice(item.marked_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 group-hover:bg-blue-600 text-slate-700 group-hover:text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span>Details</span>
                    <ArrowRight size={13} />
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
