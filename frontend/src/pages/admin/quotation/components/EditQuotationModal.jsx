import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FileText,
  X,
  Loader2,
  Plus,
  Trash2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { formatPrice, currencyType } from "../../../../lib/formatPrice";

export default function EditQuotationModal({
  isOpen,
  onClose,
  quotation,
  onQuotationUpdated,
}) {
  const [formData, setFormData] = useState({
    notes: quotation?.notes || "",
    terms: quotation?.terms || "",
    discount_type: quotation?.discount_type || "NON",
    discount: quotation?.discount ? String(quotation.discount) : "",
    tax_type: quotation?.tax_type || "NON",
    tax: quotation?.tax ? String(quotation.tax) : "",
  });

  const [items, setItems] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");
  const [addItemQuantity, setAddItemQuantity] = useState(1);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [itemActionLoading, setItemActionLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync form state when quotation prop changes
  useEffect(() => {
    if (quotation) {
      setFormData({
        notes: quotation.notes || "",
        terms: quotation.terms || "",
        discount_type: quotation.discount_type || "NON",
        discount: quotation.discount ? String(quotation.discount) : "",
        tax_type: quotation.tax_type || "NON",
        tax: quotation.tax ? String(quotation.tax) : "",
      });
      setItems(quotation.items || []);
    }
  }, [quotation]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load latest quotation items and catalog items on modal open
  useEffect(() => {
    if (!isOpen || !quotation?.id) return;

    let active = true;

    const loadData = async () => {
      try {
        setLoadingDetails(true);
        const [quoRes, catalogRes] = await Promise.all([
          axiosInstance.get(`/quotations/${quotation.id}`).catch(() => null),
          axiosInstance.get("/items", { params: { is_active: true, limit: 100 } }).catch(() => null),
        ]);

        if (active) {
          const freshQuo = quoRes?.data?.data?.quotation || quoRes?.data?.quotation;
          if (freshQuo?.items) {
            setItems(freshQuo.items);
          }
          const catItems = catalogRes?.data?.data?.items || catalogRes?.data?.items || [];
          setCatalogItems(catItems);
          if (catItems.length > 0) {
            setSelectedCatalogItemId(catItems[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load quotation items and catalog", err);
      } finally {
        if (active) setLoadingDetails(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [isOpen, quotation?.id]);

  if (!isOpen || !quotation) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add Item via quotation-items.controller.ts (POST /quotation-items/:quotation_id)
  const handleAddNewItem = async () => {
    if (!selectedCatalogItemId) {
      toast.error("Please select a hardware item from catalog");
      return;
    }

    const qty = parseInt(String(addItemQuantity), 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    const alreadyExists = items.some(
      (i) => i.solar_item_id === selectedCatalogItemId || i.solar_item?.id === selectedCatalogItemId
    );
    if (alreadyExists) {
      toast.error("This item is already included in this quotation");
      return;
    }

    setItemActionLoading(true);
    try {
      await axiosInstance.post(`/quotation-items/${quotation.id}`, {
        solar_item_id: selectedCatalogItemId,
        quantity: qty,
      });

      toast.success("Item added to quotation");

      // Refresh items list
      const freshRes = await axiosInstance.get(`/quotations/${quotation.id}`);
      const freshQuo = freshRes.data?.data?.quotation || freshRes.data?.quotation;
      if (freshQuo) {
        setItems(freshQuo.items || []);
        if (onQuotationUpdated) onQuotationUpdated(freshQuo);
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to add item");
    } finally {
      setItemActionLoading(false);
    }
  };

  // Update Item Quantity via quotation-items.controller.ts (PUT /quotation-items/:quotation_id/:item_id)
  const handleUpdateItemQuantity = async (itemId, newQuantity) => {
    const qty = parseInt(String(newQuantity), 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    setItemActionLoading(true);
    try {
      await axiosInstance.put(`/quotation-items/${quotation.id}/${itemId}`, {
        quantity: qty,
      });

      // Update local state immediately for snappy UX
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i))
      );

      // Refresh full quotation
      const freshRes = await axiosInstance.get(`/quotations/${quotation.id}`);
      const freshQuo = freshRes.data?.data?.quotation || freshRes.data?.quotation;
      if (freshQuo && onQuotationUpdated) {
        onQuotationUpdated(freshQuo);
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to update item quantity");
    } finally {
      setItemActionLoading(false);
    }
  };

  // Delete Item via quotation-items.controller.ts (DELETE /quotation-items/:quotation_id/:item_id)
  const handleDeleteItem = async (itemId) => {
    if (items.length <= 1) {
      toast.error("Quotation must have at least one line item");
      return;
    }

    setItemActionLoading(true);
    try {
      await axiosInstance.delete(`/quotation-items/${quotation.id}/${itemId}`);
      toast.success("Item removed from quotation");

      // Update local state immediately
      setItems((prev) => prev.filter((i) => i.id !== itemId));

      // Refresh full quotation
      const freshRes = await axiosInstance.get(`/quotations/${quotation.id}`);
      const freshQuo = freshRes.data?.data?.quotation || freshRes.data?.quotation;
      if (freshQuo && onQuotationUpdated) {
        onQuotationUpdated(freshQuo);
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to remove item");
    } finally {
      setItemActionLoading(false);
    }
  };

  // Calculations for live proposal breakdown
  const subtotal = items.reduce((sum, line) => {
    const unitPrice =
      line.snap_selling_price !== null && line.snap_selling_price !== undefined
        ? Number(line.snap_selling_price)
        : Number(line.solar_item?.selling_price || line.solar_item?.marked_price || 0);
    return sum + unitPrice * (Number(line.quantity) || 1);
  }, 0);

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
    taxAmount = (Math.max(0, subtotal - discountAmount) * pct) / 100;
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);

  // Submit Handler for quotations.controller.ts (PUT /quotations/:id/data, discount, tax)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
      // 1. Update notes & terms via PUT /quotations/:id/data (validates minLength 3 if provided)
      const dataPayload = {};
      const trimmedNotes = formData.notes.trim();
      const trimmedTerms = formData.terms.trim();
      if (trimmedNotes.length >= 3) dataPayload.notes = trimmedNotes;
      if (trimmedTerms.length >= 3) dataPayload.terms = trimmedTerms;
      await axiosInstance.put(`/quotations/${quotation.id}/data`, dataPayload);

      // 2. Update discount via PUT /quotations/:id/discount
      // Note: If discount_type is "NON", backend dto requires positive number so we send 1,
      // and backend sets discount: null in DB.
      if (formData.discount_type === "NON") {
        await axiosInstance.put(`/quotations/${quotation.id}/discount`, {
          discount_type: "NON",
          discount: 1,
        });
      } else {
        await axiosInstance.put(`/quotations/${quotation.id}/discount`, {
          discount_type: formData.discount_type,
          discount: Number(formData.discount),
        });
      }

      // 3. Update tax via PUT /quotations/:id/tax
      // Note: If tax_type is "NON", backend dto requires positive number so we send 1,
      // and backend sets tax: null in DB.
      if (formData.tax_type === "NON") {
        await axiosInstance.put(`/quotations/${quotation.id}/tax`, {
          tax_type: "NON",
          tax: 1,
        });
      } else {
        await axiosInstance.put(`/quotations/${quotation.id}/tax`, {
          tax_type: formData.tax_type,
          tax: Number(formData.tax),
        });
      }

      // Fetch fresh updated quotation
      const freshRes = await axiosInstance.get(`/quotations/${quotation.id}`);
      const updated = freshRes.data?.data?.quotation || freshRes.data?.quotation || {
        ...quotation,
        ...formData,
      };

      toast.success("Quotation updated successfully");
      if (onQuotationUpdated) {
        onQuotationUpdated(updated);
      }
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to update quotation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                Edit Quotation ({quotation.quotation_number})
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Update discount, taxes, hardware items, notes, and terms.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {/* Discount & Tax - ALWAYS flex-row side-by-side on all devices */}
            <div className="flex flex-row gap-2 sm:gap-3 w-full">
              {/* Discount Box */}
              <div className="flex-1 min-w-0 p-2 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 truncate">
                  Discount
                </label>
                <div className="flex flex-row items-center gap-1.5 sm:gap-2 min-w-0">
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleChange}
                    className="flex-1 min-w-0 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 truncate"
                  >
                    <option value="NON">None</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed ({currencyType})</option>
                  </select>

                  {formData.discount_type !== "NON" && (
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-14 sm:w-20 shrink-0 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  )}
                </div>
              </div>

              {/* Tax / VAT Box */}
              <div className="flex-1 min-w-0 p-2 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 truncate">
                  Tax / VAT
                </label>
                <div className="flex flex-row items-center gap-1.5 sm:gap-2 min-w-0">
                  <select
                    name="tax_type"
                    value={formData.tax_type}
                    onChange={handleChange}
                    className="flex-1 min-w-0 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 truncate"
                  >
                    <option value="NON">None</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed ({currencyType})</option>
                  </select>

                  {formData.tax_type !== "NON" && (
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="tax"
                      value={formData.tax}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-14 sm:w-20 shrink-0 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Management Section (Powered by quotation-items.controller.ts) */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>Quotation Items ({items.length})</span>
                </h4>
                {itemActionLoading && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Syncing items...</span>
                  </span>
                )}
              </div>

              {/* Add Item Row directly via POST /quotation-items/:quotation_id */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={selectedCatalogItemId}
                  onChange={(e) => setSelectedCatalogItemId(e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {catalogItems.map((catItem) => (
                    <option key={catItem.id} value={catItem.id}>
                      {catItem.title} ({catItem.code || "Item"}) — {formatPrice(catItem.selling_price || catItem.marked_price || 0)}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 justify-end">
                  <input
                    type="number"
                    min="1"
                    value={addItemQuantity}
                    onChange={(e) => setAddItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-14 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold"
                    title="Quantity"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    disabled={itemActionLoading || !selectedCatalogItemId}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Current Line Items List */}
              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-xs text-gray-400">
                    No items in this quotation yet.
                  </div>
                ) : (
                  items.map((line) => {
                    const itemTitle = line.snap_title || line.solar_item?.title || "Solar Item";
                    const itemCode = line.solar_item?.code;
                    const unitPrice =
                      line.snap_selling_price !== null && line.snap_selling_price !== undefined
                        ? Number(line.snap_selling_price)
                        : Number(line.solar_item?.selling_price || 0);
                    const lineTotal = unitPrice * (Number(line.quantity) || 1);

                    return (
                      <div
                        key={line.id}
                        className="p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {itemTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                            {itemCode && (
                              <span className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1 py-0.2 rounded font-semibold">
                                {itemCode}
                              </span>
                            )}
                            <span>{formatPrice(unitPrice)} each</span>
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-2.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) =>
                                handleUpdateItemQuantity(line.id, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-14 px-1.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            />
                          </div>

                          <span className="font-bold text-gray-900 dark:text-white min-w-[75px] text-right">
                            {formatPrice(lineTotal)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(line.id)}
                            disabled={itemActionLoading}
                            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                            title="Remove Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Delivery instructions, site specifications, etc..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Terms & Conditions
              </label>
              <textarea
                name="terms"
                rows={2}
                value={formData.terms}
                onChange={handleChange}
                placeholder="Payment schedule, validity days, warranty clause, etc..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>

            {/* Live Pricing Breakdown Sub-card */}
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-1 text-xs">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal ({items.length} items):</span>
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
          <div className="px-4 py-3 bg-gray-50/90 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || itemActionLoading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
