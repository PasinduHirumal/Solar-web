import { axiosInstance } from "./axiosInstance";

/**
 * Fetch an invoice with full price breakdown and relations directly from GET /invoices/:invoice_id.
 * If backend reports that prices are out of date (due to 60s freshness window),
 * or if invoiceObj indicates stale prices, proactively synchronizes via PUT /invoices/:invoice_id/:quotation_id.
 *
 * @param {string} invoiceId
 * @param {string} [quotationId]
 * @param {Object} [fallback={}]
 * @param {Object} [invoiceObj=null]
 * @returns {Promise<Object>}
 */
export async function fetchInvoiceById(
  invoiceId,
  quotationId,
  fallback = {},
  invoiceObj = null
) {
  if (!invoiceId) return fallback;

  // Proactive freshness check if invoiceObj is provided
  if (invoiceObj?.price_updated_at && quotationId) {
    const isStale =
      Date.now() - new Date(invoiceObj.price_updated_at).getTime() > 50000;
    if (isStale) {
      try {
        await axiosInstance.put(`/invoices/${invoiceId}/${quotationId}`);
      } catch (syncErr) {
        console.warn(`Could not pre-sync invoice prices for ${invoiceId}:`, syncErr);
      }
    }
  }

  try {
    const res = await axiosInstance.get(`/invoices/${invoiceId}`);
    return res.data?.data || res.data || fallback;
  } catch (err) {
    const msg = err.response?.data?.message;
    const isStale =
      err.response?.status === 400 &&
      (typeof msg === "string" &&
        (msg.toLowerCase().includes("out of date") ||
          msg.toLowerCase().includes("update the invoice") ||
          msg.toLowerCase().includes("freshness")));

    if (isStale && quotationId) {
      try {
        await axiosInstance.put(`/invoices/${invoiceId}/${quotationId}`);
        const retryRes = await axiosInstance.get(`/invoices/${invoiceId}`);
        return retryRes.data?.data || retryRes.data || fallback;
      } catch (retryErr) {
        console.warn(`Could not refresh invoice prices for ${invoiceId}:`, retryErr);
      }
    }
    return fallback;
  }
}

// Backward compatibility alias
export const fetchInvoiceWithBreakdown = fetchInvoiceById;

/**
 * Update an invoice's prices to the latest catalog prices in the backend database.
 * Calls backend PUT /invoices/:invoice_id/:quotation_id and returns the refreshed invoice.
 *
 * @param {string} invoiceId
 * @param {string} quotationId
 * @returns {Promise<Object>}
 */
export async function updateInvoicePrices(invoiceId, quotationId) {
  if (!invoiceId) throw new Error("Invoice ID is required to update prices");
  if (quotationId) {
    await axiosInstance.put(`/invoices/${invoiceId}/${quotationId}`);
  }
  const res = await axiosInstance.get(`/invoices/${invoiceId}`);
  return res.data?.data || res.data;
}
