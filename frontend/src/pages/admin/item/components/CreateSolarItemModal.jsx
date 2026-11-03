import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Package, X, Loader2, Layers, AlertCircle, ShieldCheck, FileText,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { currencyType } from "../../../../lib/formatPrice";

export default function CreateSolarItemModal({
  isOpen,
  onClose,
  categories = [],
  onItemCreated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    marked_price: "",
    warranty_period: "",
    warranty_details: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetAndClose = () => {
    setFormData({
      title: "",
      category_id: "",
      marked_price: "",
      warranty_period: "",
      warranty_details: "",
      description: "",
    });
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      toast.error("Item title must be at least 3 characters");
      return;
    }
    if (trimmedTitle.length > 255) {
      toast.error("Item title cannot exceed 255 characters");
      return;
    }

    if (!formData.category_id) {
      toast.error("Please select a category for this item");
      return;
    }

    const priceNum = parseFloat(formData.marked_price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid positive price");
      return;
    }
    if (priceNum > 1000000) {
      toast.error("Price cannot exceed 1,000,000");
      return;
    }

    const trimmedWarranty = formData.warranty_period.trim();
    if (trimmedWarranty && trimmedWarranty.length < 3) {
      toast.error("Warranty period must be at least 3 characters if provided");
      return;
    }
    if (trimmedWarranty && trimmedWarranty.length > 255) {
      toast.error("Warranty period cannot exceed 255 characters");
      return;
    }

    const trimmedWarrantyDetails = formData.warranty_details.trim();
    if (trimmedWarrantyDetails && trimmedWarrantyDetails.length < 3) {
      toast.error("Warranty details must be at least 3 characters if provided");
      return;
    }

    const trimmedDesc = formData.description.trim();
    if (trimmedDesc && trimmedDesc.length < 3) {
      toast.error("Description must be at least 3 characters if provided");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: trimmedTitle,
        category_id: formData.category_id,
        marked_price: priceNum,
      };

      if (trimmedWarranty) {
        payload.warranty_period = trimmedWarranty;
      }
      if (trimmedWarrantyDetails) {
        payload.warranty_details = trimmedWarrantyDetails;
      }
      if (trimmedDesc) {
        payload.description = trimmedDesc;
      }

      // Backend accepts application/json body
      const response = await axiosInstance.post("/items", payload);

      const message =
        response.data?.message || "Solar item created successfully";
      toast.success(message);

      const created = response.data?.data || response.data;
      let fullCreatedItem = created;
      if (created?.id) {
        try {
          const detailRes = await axiosInstance.get(`/items/${created.id}`);
          const fetched = detailRes.data?.data || detailRes.data;
          if (fetched) {
            fullCreatedItem = fetched;
          }
        } catch (fetchErr) {
          console.error("Failed to fetch fresh item details after create", fetchErr);
        }
      }

      if (onItemCreated) {
        onItemCreated(fullCreatedItem);
      }
      handleResetAndClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to create solar item"
      );
    } finally {
      setLoading(false);
    }
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Create Solar Item
              </h3>
              <p className="text-[11px] text-slate-500">
                Add a new hardware product to the inventory catalog.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={3}
              maxLength={255}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 550W Monocrystalline Solar Panel"
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Category & Price in two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition appearance-none cursor-pointer font-semibold"
                >
                  <option value="">Select Category</option>
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              {activeCategories.length === 0 && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  No active categories found.
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Marked Price <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  name="marked_price"
                  required
                  value={formData.marked_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition tabular-nums"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-xs">
                  {currencyType}
                </div>
              </div>
            </div>
          </div>

          {/* Warranty Period */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Warranty Period <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="warranty_period"
                minLength={3}
                maxLength={255}
                value={formData.warranty_period}
                onChange={handleChange}
                placeholder="e.g. 5 Years / 10 Years Replacement"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Manufacturer or shop warranty duration (3-255 characters if provided)
            </p>
          </div>

          {/* Warranty Details */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Warranty Terms & Coverage <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="warranty_details"
              rows={2}
              value={formData.warranty_details}
              onChange={handleChange}
              placeholder="e.g. 25-year linear performance warranty with 80% degradation limit; covers inverter replacement parts."
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition"
            />
            <p className="text-[10px] text-slate-400">
              Detailed breakdown of warranty guarantee, inclusions, and claims terms
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Features, technical specs, installation notes, etc..."
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.title.trim() ||
                !formData.category_id ||
                !formData.marked_price
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Create Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
