import React, { useState, useEffect, useMemo } from "react";
import {
  X, FileText, Percent, Receipt, Layers, AlertCircle, Loader2,
} from "lucide-react";
import { axiosInstance } from "../../../../../lib/axiosInstance";
import useAuthStore from "../../../../../lib/authStore";
import { isAdmin, isSuperAdmin } from "../../../../../lib/roles";

import EditDiscountTab from "./EditDiscountTab";
import EditTaxTab from "./EditTaxTab";
import EditDataTab from "./EditDataTab";
import EditItemsTab from "./EditItemsTab";
import PriceSummaryCard from "./PriceSummaryCard";

export default function EditQuotationModal({
  isOpen,
  onClose,
  quotation,
  onQuotationUpdated,
}) {
  const { user: currentUser } = useAuthStore();
  const userRole = currentUser?.role;

  const [latestQuotation, setLatestQuotation] = useState(quotation);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Available tabs computed based on user role and quotation status (according to quotations.controller.ts)
  const availableTabs = useMemo(() => {
    if (!latestQuotation) return [];
    const tabs = [];
    const isSuper = isSuperAdmin(userRole);
    const isAdm = isAdmin(userRole);
    const isDraft = latestQuotation.status === "DRAFT";
    const isSent = latestQuotation.status === "SENT";

    // 1. Discount endpoint: PUT /quotations/:id/discount
    // Role: ADMIN, SUPER_ADMIN | Status: DRAFT only
    if ((isAdm || isSuper) && isDraft) {
      tabs.push({
        id: "discount",
        label: "Discount",
        icon: Percent,
        description: "Configure fixed or percentage discount",
      });
    }

    // 2. Tax endpoint: PUT /quotations/:id/tax
    // Role: ADMIN, SUPER_ADMIN | Status: DRAFT only
    if ((isAdm || isSuper) && isDraft) {
      tabs.push({
        id: "tax",
        label: "Tax / VAT",
        icon: Receipt,
        description: "Configure tax or VAT rates",
      });
    }

    // 3. Line Items: /quotation-items/:quotation_id
    // Role: ADMIN only (@Roles(UserRole.ADMIN)) | Status: DRAFT or SENT
    if (isAdm && (isDraft || isSent)) {
      tabs.push({
        id: "items",
        label: "Quotation Items",
        icon: Layers,
        badge: latestQuotation.items?.length || 0,
        description: "Add, edit, or remove hardware line items",
      });
    }

    // 4. Quotation Data: PUT /quotations/:id/data
    // Role: ADMIN, SUPER_ADMIN | Status: DRAFT only
    if ((isAdm || isSuper) && isDraft) {
      tabs.push({
        id: "data",
        label: "Notes & Terms",
        icon: FileText,
        description: "Update internal notes and legal terms",
      });
    }

    return tabs;
  }, [latestQuotation, userRole]);

  const [activeTab, setActiveTab] = useState("discount");

  // Synchronize active tab whenever availableTabs changes
  useEffect(() => {
    if (availableTabs.length > 0) {
      const exists = availableTabs.some((t) => t.id === activeTab);
      if (!exists) {
        setActiveTab(availableTabs[0].id);
      }
    }
  }, [availableTabs, activeTab]);

  // Keep latest quotation in sync when prop changes
  useEffect(() => {
    if (quotation) {
      setLatestQuotation(quotation);
    }
  }, [quotation]);

  // Load fresh quotation with price breakdown when modal opens
  useEffect(() => {
    if (!isOpen || !quotation?.id) return;

    let active = true;
    const fetchLatest = async () => {
      try {
        setLoadingInitial(true);
        const res = await axiosInstance.get(`/quotations/${quotation.id}`);
        if (active) {
          const freshQuo = res.data?.data?.quotation || res.data?.quotation;
          const freshBreakdown =
            res.data?.data?.price_breakdown || res.data?.price_breakdown;
          if (freshQuo) setLatestQuotation(freshQuo);
          if (freshBreakdown) setPriceBreakdown(freshBreakdown);
        }
      } catch (err) {
        console.error("Failed to fetch fresh quotation", err);
      } finally {
        if (active) setLoadingInitial(false);
      }
    };

    fetchLatest();

    return () => {
      active = false;
    };
  }, [isOpen, quotation?.id]);

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

  if (!isOpen || !quotation) return null;

  const handleQuotationUpdated = (updatedQuotation, updatedBreakdown) => {
    if (updatedQuotation) {
      setLatestQuotation(updatedQuotation);
      if (onQuotationUpdated) {
        onQuotationUpdated(updatedQuotation);
      }
    }
    if (updatedBreakdown) {
      setPriceBreakdown(updatedBreakdown);
    }
  };

  // Switch case to mode with each tab in the edit modal as requested
  const renderTabContent = () => {
    switch (activeTab) {
      case "discount":
        return (
          <EditDiscountTab
            quotation={latestQuotation}
            priceBreakdown={priceBreakdown}
            onQuotationUpdated={handleQuotationUpdated}
          />
        );
      case "tax":
        return (
          <EditTaxTab
            quotation={latestQuotation}
            priceBreakdown={priceBreakdown}
            onQuotationUpdated={handleQuotationUpdated}
          />
        );
      case "items":
        return (
          <EditItemsTab
            quotation={latestQuotation}
            priceBreakdown={priceBreakdown}
            onQuotationUpdated={handleQuotationUpdated}
          />
        );
      case "data":
        return (
          <EditDataTab
            quotation={latestQuotation}
            priceBreakdown={priceBreakdown}
            onQuotationUpdated={handleQuotationUpdated}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-xs text-gray-400">
            Select a tab above to manage this quotation.
          </div>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                  Edit Quotation ({latestQuotation?.quotation_number})
                </h3>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${latestQuotation?.status === "ACCEPTED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : latestQuotation?.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                        : latestQuotation?.status === "SENT"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                >
                  {latestQuotation?.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                Manage tabs mapped to specific backend quotation endpoints
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

        {/* Tab Navigation Bar */}
        <div className="px-4 sm:px-5 pt-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 overflow-x-auto custom-scrollbar">
          {availableTabs.length === 0 ? (
            <div className="py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle size={14} />
              <span>No editable actions available for your user role on this quotation.</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 min-w-max pb-2">
              {availableTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shadow-xs ring-1 ring-blue-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
                      }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive
                            ? "bg-blue-200/70 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {loadingInitial ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading quotation details...</span>
            </div>
          ) : availableTabs.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
              This quotation is in <strong>{latestQuotation?.status}</strong> status and cannot be modified by your user role.
            </div>
          ) : (
            <>
              {/* Dynamic Tab Content rendered via switch-case */}
              {renderTabContent()}

              {/* Live Proposal Pricing Summary Card */}
              <PriceSummaryCard
                quotation={latestQuotation}
                priceBreakdown={priceBreakdown}
              />
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-gray-50/90 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 truncate max-w-xs">
            Role: <strong className="text-gray-700 dark:text-gray-300">{userRole || "User"}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
