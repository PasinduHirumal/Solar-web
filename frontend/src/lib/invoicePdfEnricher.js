import { axiosInstance } from "./axiosInstance";
import { generateInvoicePdf } from "./generateInvoicePdf";

// In-memory catalog and quotation cache
let solarItemsCatalogCache = null;
let solarItemsCatalogPromise = null;
const quotationsDetailCache = new Map();

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

/**
 * Fetch an invoice with full price breakdown and relations from GET /invoices/:invoice_id.
 * If backend reports that prices are out of date (due to 60s freshness window),
 * automatically calls PUT /invoices/:invoice_id/:quotation_id and retries.
 *
 * @param {string} invoiceId
 * @param {string} [quotationId]
 * @param {Object} [fallback={}]
 * @returns {Promise<Object>}
 */
export async function fetchInvoiceWithBreakdown(invoiceId, quotationId, fallback = {}) {
  if (!invoiceId) return fallback;
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

/**
 * Fetch and cache full solar items catalog with categories
 */
export async function getSolarItemsCatalog() {
  if (solarItemsCatalogCache) return solarItemsCatalogCache;
  if (solarItemsCatalogPromise) return await solarItemsCatalogPromise;

  solarItemsCatalogPromise = (async () => {
    try {
      const res = await axiosInstance.get("/items", { params: { limit: 100 } });
      const rawList = res.data?.data?.items || res.data?.items || [];
      const byId = new Map();
      const byCode = new Map();
      const byTitle = new Map();

      rawList.forEach((item) => {
        if (item.id) byId.set(item.id, item);
        if (item.code) byCode.set(item.code.toLowerCase(), item);
        if (item.title) byTitle.set(item.title.trim().toLowerCase(), item);
      });

      solarItemsCatalogCache = { rawList, byId, byCode, byTitle };
      return solarItemsCatalogCache;
    } catch (err) {
      console.warn("Could not load solar items catalog cache", err);
      return { rawList: [], byId: new Map(), byCode: new Map(), byTitle: new Map() };
    } finally {
      solarItemsCatalogPromise = null;
    }
  })();

  return await solarItemsCatalogPromise;
}

/**
 * Enrich quotation and invoice items with full relations (solar_item, code, category).
 * Queries /quotations/:id and /items if necessary.
 *
 * @param {Object} invoice
 * @param {Object} quotation
 * @returns {Promise<{ enrichedInvoice: Object, enrichedQuotation: Object, enrichedItems: Array }>}
 */
export async function enrichInvoiceAndQuotation(invoice, quotation) {
  const quoId = quotation?.id || quotation?.quotation_id || invoice?.quotation_id || invoice?.quotation?.id;
  const invId = invoice?.id;

  // 1. Fetch invoice details if available (GET /invoices/:invoice_id returns quotation, customer, items, and payments)
  let fullInv = invoice || {};
  if (invId && (!fullInv.subtotal || !fullInv.invoice_number || !fullInv.quotation?.items)) {
    try {
      fullInv = await fetchInvoiceWithBreakdown(invId, quoId, fullInv);
    } catch (err) {
      console.warn(`Could not load invoice ${invId}`, err);
    }
  }

  // 2. Reuse quotation from full invoice, or fetch if items are not yet present
  let fullQuo = fullInv.quotation || quotation;
  if (quoId && (!fullQuo?.items || fullQuo.items.length === 0)) {
    if (quotationsDetailCache.has(quoId)) {
      fullQuo = quotationsDetailCache.get(quoId);
    } else {
      try {
        const quoRes = await axiosInstance.get(`/quotations/${quoId}`);
        const loadedQuo =
          quoRes.data?.data?.quotation ||
          quoRes.data?.data ||
          quoRes.data?.quotation ||
          quoRes.data;
        if (loadedQuo && loadedQuo.id) {
          quotationsDetailCache.set(quoId, loadedQuo);
          fullQuo = loadedQuo;
        }
      } catch (err) {
        console.warn(`Could not load quotation ${quoId}`, err);
      }
    }
  }

  // 3. Load catalog cache for backup category & code resolution
  const catalog = await getSolarItemsCatalog();

  // 4. Map items from full quotation
  const fullQuoItems = fullQuo?.items || [];
  const itemBySolarId = new Map();
  const itemById = new Map();

  fullQuoItems.forEach((qi) => {
    if (qi.id) itemById.set(qi.id, qi);
    if (qi.solar_item_id) itemBySolarId.set(qi.solar_item_id, qi);
    if (qi.solar_item?.id) itemBySolarId.set(qi.solar_item.id, qi);
  });

  // Base list of items to display
  const baseItems =
    fullQuoItems.length > 0
      ? fullQuoItems
      : fullInv?.quotation?.items || invoice?.quotation?.items || quotation?.items || [];

  const enrichedItems = baseItems.map((item) => {
    // Matched quotation item
    const matched =
      itemById.get(item.id) ||
      itemBySolarId.get(item.solar_item_id) ||
      itemBySolarId.get(item.solar_item?.id) ||
      {};

    // Fallback catalog lookup by ID, code, or title
    const catalogItem =
      (item.solar_item_id && catalog.byId.get(item.solar_item_id)) ||
      (item.solar_item?.id && catalog.byId.get(item.solar_item.id)) ||
      (matched.solar_item_id && catalog.byId.get(matched.solar_item_id)) ||
      (matched.solar_item?.id && catalog.byId.get(matched.solar_item.id)) ||
      (item.solar_item?.code && catalog.byCode.get(item.solar_item.code.toLowerCase())) ||
      (item.code && catalog.byCode.get(item.code.toLowerCase())) ||
      (item.snap_title && catalog.byTitle.get(item.snap_title.trim().toLowerCase())) ||
      (matched.snap_title && catalog.byTitle.get(matched.snap_title.trim().toLowerCase())) ||
      {};

    const solarItem = {
      ...(catalogItem || {}),
      ...(matched.solar_item || {}),
      ...(item.solar_item || {}),
    };

    const categoryObj =
      item.solar_item?.category ||
      matched.solar_item?.category ||
      catalogItem.category ||
      item.category ||
      matched.category;

    const categoryTitle =
      typeof categoryObj === "object"
        ? categoryObj?.title
        : typeof categoryObj === "string"
        ? categoryObj
        : null;

    const code =
      solarItem.code ||
      item.code ||
      matched.code ||
      catalogItem.code;

    return {
      ...catalogItem,
      ...matched,
      ...item,
      code,
      solar_item: {
        ...solarItem,
        code,
        category: categoryTitle ? { title: categoryTitle } : undefined,
      },
    };
  });

  const enrichedQuotation = {
    ...(fullQuo || {}),
    ...(fullInv?.quotation || {}),
    customer:
      fullQuo?.customer ||
      fullInv?.quotation?.customer ||
      invoice?.customer ||
      quotation?.customer ||
      {},
    items: enrichedItems,
  };

  const enrichedInvoice = {
    ...(fullInv || {}),
    quotation: enrichedQuotation,
  };

  return {
    enrichedInvoice,
    enrichedQuotation,
    enrichedItems,
  };
}

/**
 * Generate PDF with enriched quotation & invoice details
 */
export async function generateEnrichedInvoicePdf({
  invoice,
  quotation,
  customer,
  items,
  dueDate,
  priceBreakdown,
}) {
  const { enrichedInvoice, enrichedQuotation, enrichedItems } =
    await enrichInvoiceAndQuotation(invoice, quotation);

  return generateInvoicePdf({
    invoice: enrichedInvoice,
    quotation: enrichedQuotation,
    customer: customer || enrichedQuotation.customer,
    items: items && items.length > 0 ? items : enrichedItems,
    dueDate: dueDate || enrichedInvoice.due_date,
    priceBreakdown,
  });
}
