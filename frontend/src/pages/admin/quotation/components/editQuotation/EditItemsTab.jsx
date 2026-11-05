import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Layers, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { axiosInstance } from "../../../../../lib/axiosInstance";
import { formatPrice } from "../../../../../lib/formatPrice";
import { syncInvoiceForQuotation } from "../../../../../lib/invoicePdfEnricher";

export default function EditItemsTab({
  quotation,
  onQuotationUpdated,
}) {
  const [items, setItems] = useState(quotation?.items || []);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");
  const [addItemQuantity, setAddItemQuantity] = useState(1);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingQtyMap, setEditingQtyMap] = useState({});

  useEffect(() => {
    if (quotation?.items) {
      setItems(quotation.items);
      const initialQtyMap = {};
      quotation.items.forEach((it) => {
        initialQtyMap[it.id] = it.quantity;
      });
      setEditingQtyMap(initialQtyMap);
    }
  }, [quotation]);

  // Load catalog items for adding new item
  useEffect(() => {
    let active = true;
    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        const res = await axiosInstance.get("/items", {
          params: { is_active: true, limit: 100 },
        });
        if (active) {
          const list = res.data?.data?.items || res.data?.items || [];
          setCatalogItems(list);
          if (list.length > 0) {
            setSelectedCatalogItemId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog items", err);
      } finally {
        if (active) setCatalogLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      active = false;
    };
  }, []);

  const isEditable =
    quotation?.status === "DRAFT" || quotation?.status === "SENT";

  const refreshQuotationData = async () => {
    try {
      const res = await axiosInstance.get(`/quotations/${quotation.id}`);
      const freshQuo = res.data?.data?.quotation || res.data?.quotation;
      const freshBreakdown =
        res.data?.data?.price_breakdown || res.data?.price_breakdown;
      if (freshQuo) {
        setItems(freshQuo.items || []);

        // Automatically sync invoice prices if an invoice exists for this quotation
        await syncInvoiceForQuotation(quotation.id, quotation.invoice_id);

        if (onQuotationUpdated) {
          onQuotationUpdated(freshQuo, freshBreakdown);
        }
      }
    } catch (err) {
      console.error("Failed to refresh quotation", err);
    }
  };

  // Add Item via POST /quotation-items/:quotation_id
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!isEditable) {
      toast.error(`Cannot add items when quotation is in ${quotation?.status} status`);
      return;
    }

    if (!selectedCatalogItemId) {
      toast.error("Please select an item from the catalog");
      return;
    }

    const qty = parseInt(String(addItemQuantity), 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be a positive integer (minimum 1)");
      return;
    }

    if (items.length >= 25) {
      toast.error("Maximum 25 items allowed for a quotation");
      return;
    }

    const alreadyExists = items.some(
      (i) =>
        i.solar_item_id === selectedCatalogItemId ||
        i.solar_item?.id === selectedCatalogItemId
    );
    if (alreadyExists) {
      toast.error("This item is already included in this quotation");
      return;
    }

    setActionLoading(true);
    try {
      await axiosInstance.post(`/quotation-items/${quotation.id}`, {
        solar_item_id: selectedCatalogItemId,
        quantity: qty,
      });

      toast.success("Item added successfully");
      setAddItemQuantity(1);
      await refreshQuotationData();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to add item");
    } finally {
      setActionLoading(false);
    }
  };

  // Update Item Quantity via PUT /quotation-items/:quotation_id/:item_id
  const handleUpdateQuantity = async (itemId) => {
    const qty = parseInt(String(editingQtyMap[itemId]), 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    setActionLoading(true);
    try {
      await axiosInstance.put(`/quotation-items/${quotation.id}/${itemId}`, {
        quantity: qty,
      });

      toast.success("Item quantity updated");
      await refreshQuotationData();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to update quantity");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Item via DELETE /quotation-items/:quotation_id/:item_id
  const handleDeleteItem = async (itemId) => {
    if (items.length <= 1) {
      toast.error("A quotation must have at least one line item");
      return;
    }

    setActionLoading(true);
    try {
      await axiosInstance.delete(`/quotation-items/${quotation.id}/${itemId}`);
      toast.success("Item removed from quotation");
      await refreshQuotationData();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to remove item");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isEditable && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            This quotation is in <strong>{quotation?.status}</strong> status. Line items cannot be modified.
          </span>
        </div>
      )}

      {/* Add New Line Item Row */}
      {isEditable && (
        <form
          onSubmit={handleAddItem}
          className="p-3 sm:p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-2xs"
        >
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
              Select Hardware Item from Catalog
            </label>
            <select
              value={selectedCatalogItemId}
              onChange={(e) => setSelectedCatalogItemId(e.target.value)}
              disabled={catalogLoading || actionLoading}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 truncate shadow-2xs"
            >
              {catalogLoading ? (
                <option value="">Loading catalog items...</option>
              ) : catalogItems.length === 0 ? (
                <option value="">No items available in catalog</option>
              ) : (
                catalogItems.map((catItem) => (
                  <option key={catItem.id} value={catItem.id}>
                    {catItem.title} ({catItem.code || "Item"}) —{" "}
                    {formatPrice(catItem.selling_price || catItem.marked_price || 0)}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-end gap-2 justify-end shrink-0">
            <div>
              <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1 text-center">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={addItemQuantity}
                onChange={(e) =>
                  setAddItemQuantity(
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                }
                disabled={actionLoading}
                className="w-16 px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading || !selectedCatalogItemId || catalogLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer h-[35px] active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </form>
      )}

      {/* Current Items List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
          <span>Current Items ({items.length} of max 25)</span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 bg-slate-50/50">
            No items in this quotation yet.
          </div>
        ) : (
          items.map((line) => {
            const itemTitle =
              line.snap_title || line.solar_item?.title || "Solar Item";
            const itemCode = line.solar_item?.code;
            const unitPrice =
              line.snap_selling_price !== null &&
              line.snap_selling_price !== undefined
                ? Number(line.snap_selling_price)
                : Number(line.solar_item?.selling_price || 0);
            const lineTotal =
              unitPrice * (Number(editingQtyMap[line.id] ?? line.quantity) || 1);
            const hasQtyChanged =
              String(editingQtyMap[line.id]) !== String(line.quantity);

            return (
              <div
                key={line.id}
                className="p-3 sm:p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors hover:border-slate-300 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">
                    {itemTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    {itemCode && (
                      <span className="font-mono text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                        {itemCode}
                      </span>
                    )}
                    <span className="font-mono">{formatPrice(unitPrice)} each</span>
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Qty:
                    </span>
                    <input
                      type="number"
                      min="1"
                      disabled={!isEditable || actionLoading}
                      value={editingQtyMap[line.id] ?? line.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setEditingQtyMap((prev) => ({
                          ...prev,
                          [line.id]: Math.max(1, val),
                        }));
                      }}
                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center disabled:opacity-50 shadow-2xs"
                    />

                    {isEditable && hasQtyChanged && (
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(line.id)}
                        disabled={actionLoading}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition cursor-pointer shadow-2xs active:scale-[0.98]"
                        title="Save quantity change"
                      >
                        Save
                      </button>
                    )}
                  </div>

                  <span className="font-mono font-bold text-slate-900 min-w-[80px] text-right">
                    {formatPrice(lineTotal)}
                  </span>

                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(line.id)}
                      disabled={actionLoading}
                      className="w-7 h-7 flex items-center justify-center text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition cursor-pointer disabled:opacity-50"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
