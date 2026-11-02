import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FileText,
  X,
  Loader2,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Layers,
  DollarSign,
  Percent,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { formatPrice, currencyType } from "../../../../lib/formatPrice";

export default function CreateQuotationModal({
  isOpen,
  onClose,
  onQuotationCreated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    discount_type: "NON",
    discount: "",
    tax_type: "NON",
    tax: "",
    notes: "",
    terms: "",
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const res = await axiosInstance.get("/items", {
          params: { is_active: true, limit: 100 },
        });
        if (active) {
          const items = res.data?.data?.items || res.data?.items || [];
          setAvailableItems(items);
        }
      } catch (err) {
        console.error("Failed to load inventory for quotation", err);
      } finally {
        if (active) setLoadingItems(false);
      }
    };

    fetchItems();

    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    // Pick first available item not already selected
    const unselected = availableItems.find(
      (item) => !selectedItems.some((s) => s.solar_item_id === item.id)
    );
    if (!unselected && availableItems.length > 0) {
      toast.error("All catalog items have already been added");
      return;
    }
    if (availableItems.length === 0) {
      toast.error("No active solar items found in catalog");
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        solar_item_id: unselected.id,
        quantity: 1,
        unit_price: unselected.selling_price || unselected.marked_price || 0,
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    setSelectedItems((prev) => {
      const next = [...prev];
      if (field === "solar_item_id") {
        const itemObj = availableItems.find((i) => i.id === value);
        next[index] = {
          ...next[index],
          solar_item_id: value,
          unit_price: itemObj ? itemObj.selling_price || itemObj.marked_price || 0 : 0,
        };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleResetAndClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      discount_type: "NON",
      discount: "",
      tax_type: "NON",
      tax: "",
      notes: "",
      terms: "",
    });
    setSelectedItems([]);
    setLoading(false);
    onClose();
  };

  // Calculations
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
    0
  );

  let discountAmount = 0;
  if (formData.discount_type === "FIXED") {
    discountAmount = Math.max(0, Number(formData.discount) || 0);
  } else if (formData.discount_type === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, Number(formData.discount) || 0));
    discountAmount = (subtotal * pct) / 100;
  }

  let taxAmount = 0;
  if (formData.tax_type === "FIXED") {
    taxAmount = Math.max(0, Number(formData.tax) || 0);
  } else if (formData.tax_type === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, Number(formData.tax) || 0));
    taxAmount = (subtotal * pct) / 100;
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedAddress) {
      toast.error("Customer Name, Email, Phone, and Address are required");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please add at least one solar hardware item to the quotation");
      return;
    }

    for (let i = 0; i < selectedItems.length; i++) {
      const line = selectedItems[i];
      const qNum = Number(line.quantity);
      if (isNaN(qNum) || qNum <= 0) {
        toast.error(`Item #${i + 1} must have a valid quantity of at least 1`);
        return;
      }
    }

    if (formData.discount_type !== "NON") {
      const dNum = parseFloat(formData.discount);
      if (isNaN(dNum) || dNum <= 0) {
        toast.error("Discount value must be a positive number");
        return;
      }
      if (formData.discount_type === "PERCENTAGE" && dNum >= 100) {
        toast.error("Discount percentage must be less than 100%");
        return;
      }
    }

    if (formData.tax_type !== "NON") {
      const tNum = parseFloat(formData.tax);
      if (isNaN(tNum) || tNum <= 0) {
        toast.error("Tax value must be a positive number");
        return;
      }
      if (formData.tax_type === "PERCENTAGE" && tNum >= 100) {
        toast.error("Tax percentage must be less than 100%");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        phone: trimmedPhone,
        address: trimmedAddress,
        item_ids: selectedItems.map((i) => ({
          solar_item_id: i.solar_item_id,
          quantity: Number(i.quantity),
        })),
      };

      if (formData.discount_type !== "NON" && Number(formData.discount) > 0) {
        payload.discount_type = formData.discount_type;
        payload.discount = Number(formData.discount);
      }

      if (formData.tax_type !== "NON" && Number(formData.tax) > 0) {
        payload.tax_type = formData.tax_type;
        payload.tax = Number(formData.tax);
      }

      if (formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      }
      if (formData.terms.trim()) {
        payload.terms = formData.terms.trim();
      }

      const response = await axiosInstance.post("/quotations", payload);
      const created = response.data?.data || response.data;
      toast.success("Quotation created successfully");

      if (onQuotationCreated) {
        onQuotationCreated(created);
      }
      handleResetAndClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to create quotation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                Create Solar Quotation
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Generate a formal hardware quote proposal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form
          id="create-quotation-form"
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {/* Section 1: Customer Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Customer Information</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    minLength={3}
                    maxLength={255}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Kasun Perera"
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. customer@example.com"
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +94771234567 or 0771234567"
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Installation / Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    minLength={3}
                    maxLength={255}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 123 Galle Road, Colombo 03"
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Line Items */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>Quotation Items ({selectedItems.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Item</span>
                </button>
              </div>

              {selectedItems.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-xs text-gray-400">
                  No items added yet. Click &quot;Add Item&quot; to pick equipment from catalog.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedItems.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 space-y-2 text-xs"
                    >
                      {/* Top Row: Item Selector (full width on all viewports) */}
                      <div>
                        <select
                          value={line.solar_item_id}
                          onChange={(e) => handleItemChange(idx, "solar_item_id", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {availableItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.title} ({item.code}) — {formatPrice(item.selling_price || item.marked_price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Bottom Row: Quantity on left, Subtotal + Delete button on right */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                        {/* Quantity */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                            Qty:
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            required
                            value={line.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            className="w-16 sm:w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          />
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                            {formatPrice(line.unit_price * (Number(line.quantity) || 1))}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                            title="Remove Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Discount & Tax */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Discount */}
              <div className="space-y-1.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Discount
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleChange}
                    className="w-36 shrink-0 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NON">None</option>
                    <option value="FIXED">Fixed ({currencyType})</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>

                  {formData.discount_type !== "NON" && (
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="discount"
                      required
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder={formData.discount_type === "PERCENTAGE" ? "e.g. 5" : "e.g. 500"}
                      className="flex-1 min-w-0 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Tax */}
              <div className="space-y-1.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Tax / VAT
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="tax_type"
                    value={formData.tax_type}
                    onChange={handleChange}
                    className="w-36 shrink-0 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NON">None</option>
                    <option value="FIXED">Fixed ({currencyType})</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>

                  {formData.tax_type !== "NON" && (
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="tax"
                      required
                      value={formData.tax}
                      onChange={handleChange}
                      placeholder={formData.tax_type === "PERCENTAGE" ? "e.g. 18" : "e.g. 1500"}
                      className="flex-1 min-w-0 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Notes & Terms */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Special instructions or site notes..."
                  className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Terms & Conditions <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="terms"
                  rows={2}
                  value={formData.terms}
                  onChange={handleChange}
                  placeholder="Payment structure, warranty clause..."
                  className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Price Breakdown Sub-card */}
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal ({selectedItems.length} items):</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                  <span>Tax:</span>
                  <span className="font-semibold">+{formatPrice(taxAmount)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between">
                <span className="font-bold text-gray-800 dark:text-gray-200">Total Proposal:</span>
                <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="px-4 py-3 bg-gray-50/90 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between gap-2.5">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Total</span>
              <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                {formatPrice(grandTotal)}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.name.trim() ||
                  !formData.email.trim() ||
                  !formData.phone.trim() ||
                  !formData.address.trim() ||
                  selectedItems.length === 0
                }
                className="px-3.5 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                <span>Generate Quotation</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
