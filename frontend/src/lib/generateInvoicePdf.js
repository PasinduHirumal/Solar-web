import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPrice, currencyType } from "./formatPrice";
import { contactDetails, paymentDetails } from "../data/dataset";

/**
 * Generates an executive, professional PDF invoice directly on the client.
 *
 * @param {Object} params
 * @param {Object} params.quotation - Quotation entity with items, discount, tax, notes, terms, etc.
 * @param {Object} [params.invoice] - Optional existing invoice entity (invoice_number, due_date, etc.)
 * @param {Object} [params.customer] - Customer data (name, email, phone, address)
 * @param {Array}  [params.items] - Quotation line items with solar_item or snap fields
 * @param {Object} [params.priceBreakdown] - Precalculated subtotal, discount, tax, total
 * @param {string|Date} [params.dueDate] - Invoice due date
 * @returns {{ doc: jsPDF, blob: Blob, file: File, url: string, invoiceNumber: string }}
 */
export function generateInvoicePdf({
  invoice,
  quotation: fallbackQuotation,
  customer: overrideCustomer,
  items: overrideItems,
  dueDate: overrideDueDate,
}) {
  const currentInvoice = invoice || {};
  const currentQuo = currentInvoice.quotation || fallbackQuotation || {};
  const currentCustomer = overrideCustomer || currentQuo.customer || currentInvoice.customer || {};
  const currentItems = overrideItems || currentQuo.items || [];

  // Generate or determine invoice number
  const invoiceNumber =
    currentInvoice.invoice_number ||
    (currentQuo.quotation_number
      ? currentQuo.quotation_number.replace(/^SO-QU-/, "SO-INV-")
      : `SO-INV-${Date.now().toString(36).toUpperCase()}`);

  const quotationNumber = currentQuo.quotation_number || null;

  // Extract pricing directly from invoice entity or calculate from quotation
  let subtotal = Number(currentInvoice.subtotal || 0);
  if (!subtotal && currentItems.length > 0) {
    subtotal = currentItems.reduce((sum, line) => {
      const price = Number(line.snap_selling_price ?? line.solar_item?.selling_price ?? 0);
      const qty = Number(line.quantity || 1);
      return sum + price * qty;
    }, 0);
  }

  let discountAmount = Number(currentInvoice.discount || 0);
  if (!discountAmount && currentQuo.discount) {
    const rawDisc = Number(currentQuo.discount);
    discountAmount =
      currentQuo.discount_type === "PERCENTAGE"
        ? (subtotal * rawDisc) / 100
        : rawDisc;
  }

  let taxAmount = Number(currentInvoice.tax || 0);
  if (!taxAmount && currentQuo.tax) {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const rawTax = Number(currentQuo.tax);
    taxAmount =
      currentQuo.tax_type === "PERCENTAGE"
        ? (taxableAmount * rawTax) / 100
        : rawTax;
  }

  let grandTotal = Number(currentInvoice.total || 0);
  if (!grandTotal) {
    grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
  }

  let paidAmount = Number(currentInvoice.paid_amount || 0);
  if (!paidAmount && Array.isArray(currentInvoice.payments) && currentInvoice.payments.length > 0) {
    paidAmount = currentInvoice.payments
      .filter((p) => p.status !== "REVOKED")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }
  const balance = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);

  // Dates
  const issueDateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const dueDateRaw = overrideDueDate || invoice?.due_date || null;
  const dueDateStr = dueDateRaw
    ? new Date(dueDateRaw).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // Create A4 PDF doc
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Top corporate accent banner
  doc.setFillColor(0, 139, 215); // #008BD7 (Shree Blue)
  doc.rect(0, 0, pageWidth, 4, "F");

  // Secondary thin green line
  doc.setFillColor(99, 183, 35); // #63B723 (Green accent)
  doc.rect(0, 4, pageWidth, 1, "F");

  // 2. Company Header
  let cursorY = 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(3, 31, 76); // #031F4C (Navy)
  doc.text(contactDetails.companyName || "SHREE ENERGY (PVT) LTD", margin, cursorY);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 139, 215);
  doc.text(contactDetails.tagline || "SMART ENERGY SOLUTIONS • SRI LANKA", margin, cursorY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(contactDetails.motto || "Renewable Energy Systems & Engineering Services", margin, cursorY + 8.5);

  // Company details on right dynamically from dataset.js
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const companyRightX = pageWidth - margin;

  const hotlineList = contactDetails.phones?.map((p) => p.display || p.number).filter(Boolean) || [];
  const hotlineString = hotlineList.join(" / ");
  const primaryEmail = contactDetails.emails?.[0]?.address;
  const websiteUrl = contactDetails.social?.website || contactDetails.website;
  const cleanWeb = websiteUrl ? websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";
  const officeAddress = contactDetails.address?.street;

  let rightHeaderY = cursorY;
  if (hotlineString) {
    doc.text(`Hotline: ${hotlineString}`, companyRightX, rightHeaderY, { align: "right" });
    rightHeaderY += 4;
  }

  const contactParts = [];
  if (primaryEmail) contactParts.push(`Email: ${primaryEmail}`);
  if (cleanWeb) contactParts.push(`Web: ${cleanWeb}`);
  if (contactParts.length > 0) {
    doc.text(contactParts.join(" | "), companyRightX, rightHeaderY, { align: "right" });
    rightHeaderY += 4;
  }

  if (officeAddress) {
    doc.text(`Corporate Office: ${officeAddress}`, companyRightX, rightHeaderY, { align: "right" });
    rightHeaderY += 4;
  }

  cursorY += 14;

  // Subtle divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);

  cursorY += 6;

  // 3. Invoice Title & Meta Card
  // Left: INVOICE heading and numbers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(3, 31, 76);
  doc.text("COMMERCIAL INVOICE", margin, cursorY + 4);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 139, 215);
  doc.text(`Invoice No: ${invoiceNumber}`, margin, cursorY + 10);

  if (quotationNumber) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Quotation Ref: ${quotationNumber}`, margin, cursorY + 14.5);
  }

  // Right: Date & Status Pill
  const metaRightX = pageWidth - margin;
  let metaRightY = cursorY + 3.5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice Date: ${issueDateStr}`, metaRightX, metaRightY, { align: "right" });

  if (dueDateStr) {
    metaRightY += 4.5;
    doc.text(`Payment Due: ${dueDateStr}`, metaRightX, metaRightY, { align: "right" });
  }

  // Payment status badge
  const effectiveStatus = (
    currentInvoice.payment_status ||
    (paidAmount >= grandTotal && grandTotal > 0
      ? "PAID"
      : paidAmount > 0
      ? "PARTIAL"
      : "PENDING")
  ).toUpperCase();

  let statusBg = [254, 243, 199];
  let statusFg = [180, 83, 9];
  let statusLabel = "PAYMENT PENDING";

  if (effectiveStatus === "PAID") {
    statusBg = [220, 252, 231];
    statusFg = [21, 128, 61];
    statusLabel = "PAID IN FULL";
  } else if (effectiveStatus === "PARTIAL") {
    statusBg = [243, 232, 255];
    statusFg = [126, 34, 206];
    statusLabel = "PARTIAL PAYMENT";
  } else if (effectiveStatus === "ADVANCED") {
    statusBg = [219, 234, 254];
    statusFg = [29, 78, 216];
    statusLabel = "ADVANCE PAYMENT";
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const badgeTextWidth = doc.getTextWidth(statusLabel);
  const badgeWidth = Math.max(28, badgeTextWidth + 6);
  const badgeHeight = 5.5;
  const badgeX = metaRightX - badgeWidth;
  const badgeY = metaRightY + 2.5;

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "F");
  doc.setTextColor(statusFg[0], statusFg[1], statusFg[2]);
  doc.text(statusLabel, badgeX + badgeWidth / 2, badgeY + 3.8, { align: "center" });

  cursorY += 21;

  // 4. Billed To (Customer Card) - Only display if actual customer data received from backend!
  const custName = currentCustomer.name?.trim();
  const custEmail = currentCustomer.email?.trim();
  const custPhone = currentCustomer.phone?.trim();
  const custAddress = currentCustomer.address?.trim();
  const hasCustomerInfo = Boolean(custName || custEmail || custPhone || custAddress);

  if (hasCustomerInfo) {
    let cardContentHeight = 6;
    if (custName) cardContentHeight += 5;
    if (custEmail || custPhone) cardContentHeight += 4.5;
    if (custAddress) cardContentHeight += 4.5;
    const customerCardHeight = cardContentHeight + 2;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, customerCardHeight, 2, 2, "FD");

    let textY = cursorY + 4.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 139, 215);
    doc.text("BILLED TO / CUSTOMER DETAILS", margin + 4, textY);
    textY += 4.8;

    if (custName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(custName, margin + 4, textY);
      textY += 4.5;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    if (custEmail || custPhone) {
      if (custEmail) {
        doc.text(`Email: ${custEmail}`, margin + 4, textY);
      }
      if (custPhone) {
        const phoneX = custEmail ? margin + 80 : margin + 4;
        doc.text(`Phone: ${custPhone}`, phoneX, textY);
      }
      textY += 4.2;
    }

    if (custAddress) {
      doc.text(`Address: ${custAddress}`, margin + 4, textY);
      textY += 4.2;
    }

    cursorY += customerCardHeight + 5;
  }

  // 5. Line Items Table (via jspdf-autotable)
  let finalTableY = cursorY;
  if (currentItems.length > 0) {
    const tableRows = currentItems.map((line, idx) => {
      const itemTitle = line.snap_title || "Solar Equipment";
      const warranty = line.snap_warranty_period;
      const unitPrice = Number(line.snap_selling_price || 0);
      const qty = Number(line.quantity || 1);
      const lineTotal = unitPrice * qty;

      const description = warranty
        ? `${itemTitle}\nWarranty: ${warranty}`
        : itemTitle;

      return [
        idx + 1,
        description,
        qty,
        formatPrice(unitPrice).replace(/^[A-Z]+\s*/, ""),
        formatPrice(lineTotal).replace(/^[A-Z]+\s*/, ""),
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["#", "Solar Equipment & Warranty Details", "Qty", `Unit Price (${currencyType})`, `Total (${currencyType})`]],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [3, 31, 76],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 2.5,
        halign: "left",
      },
      styles: {
        font: "helvetica",
        fontSize: 7.5,
        textColor: [30, 41, 59],
        cellPadding: 2.2,
        lineColor: [241, 245, 249],
        lineWidth: 0.2,
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 98 },
        2: { halign: "center", cellWidth: 16 },
        3: { halign: "right", cellWidth: 28 },
        4: { halign: "right", cellWidth: 30 },
      },
    });

    finalTableY = doc.lastAutoTable.finalY + 4;
  }

  // 6. Bottom Section: Bank Payment Details (Left) & Price Summary (Right)
  const summaryWidth = 74;
  const summaryX = pageWidth - margin - summaryWidth;
  const bankDetailsWidth = summaryX - margin - 6;

  // Prepare Terms, Notes, and Cheque Note strings (strictly from backend and config)
  const rawTerms = currentQuo.terms && typeof currentQuo.terms === "string" ? currentQuo.terms.trim() : "";
  const rawNotes = currentQuo.notes && typeof currentQuo.notes === "string" ? currentQuo.notes.trim() : "";
  const rawChequeNote = paymentDetails?.chequeNote && typeof paymentDetails.chequeNote === "string" ? paymentDetails.chequeNote.trim() : "";

  // The bank details box height without cheque note
  const bankBoxHeight = 35;
  let summaryBoxHeight = 36;
  if (discountAmount > 0) summaryBoxHeight += 4.5;
  if (taxAmount > 0) summaryBoxHeight += 4.5;
  const boxesHeight = Math.max(bankBoxHeight, summaryBoxHeight);

  // Dynamic precise calculation of extra height needed for terms, notes, and cheque note below the boxes
  let extraHeight = 0;
  if (rawTerms) {
    const splitTerms = doc.splitTextToSize(rawTerms, pageWidth - margin * 2);
    extraHeight += 4.5 + splitTerms.length * 3.4;
  }
  if (rawNotes) {
    const splitNotes = doc.splitTextToSize(rawNotes, pageWidth - margin * 2);
    extraHeight += 4.5 + splitNotes.length * 3.4;
  }
  if (rawChequeNote) {
    const splitCheque = doc.splitTextToSize(`• ${rawChequeNote}`, pageWidth - margin * 2);
    extraHeight += 3.5 + splitCheque.length * 3.4;
  }

  const totalRequiredBottomSpace = boxesHeight + extraHeight + 6;

  let bottomBlockY = finalTableY;
  if (bottomBlockY + totalRequiredBottomSpace > pageHeight - 24) {
    doc.addPage();
    // Top accent bar for secondary page
    doc.setFillColor(0, 139, 215);
    doc.rect(0, 0, pageWidth, 4, "F");
    doc.setFillColor(99, 183, 35);
    doc.rect(0, 4, pageWidth, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(3, 31, 76);
    doc.text(`${contactDetails.companyName || "SHREE ENERGY (PVT) LTD"} • INVOICE REF: ${invoiceNumber}`, margin, 12);
    bottomBlockY = 18;
  }

  // Bank & Payment Instructions (Left box from dataset.js)
  // chequeNote is removed from this box per requirement
  if (paymentDetails?.bankName) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, bottomBlockY, bankDetailsWidth, boxesHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 139, 215);
    doc.text(paymentDetails.title || "PAYMENT INSTRUCTIONS & BANK DETAILS", margin + 3.5, bottomBlockY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Bank Name: ${paymentDetails.bankName}`, margin + 3.5, bottomBlockY + 9.5);
    doc.text(`Account Name: ${paymentDetails.accountName}`, margin + 3.5, bottomBlockY + 14);
    doc.text(`Account Number: ${paymentDetails.accountNumber}`, margin + 3.5, bottomBlockY + 18.5);
    doc.text(`Branch: ${paymentDetails.branch}${paymentDetails.swiftCode ? ` (Swift: ${paymentDetails.swiftCode})` : ""}`, margin + 3.5, bottomBlockY + 23);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Payment Reference: ${paymentDetails.paymentReferenceNote}`, margin + 3.5, bottomBlockY + 27.5);

    if (balance <= 0 && grandTotal > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(21, 128, 61); // emerald-700
      doc.text("• Settlement Status: Paid in Full", margin + 3.5, bottomBlockY + 31.5);
    } else if (paidAmount > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(0, 139, 215); // blue
      doc.text(`• Advance/Partial Paid: ${formatPrice(paidAmount)}`, margin + 3.5, bottomBlockY + 31.5);
    }
  }

  // Price Summary Box (Right box)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(summaryX, bottomBlockY, summaryWidth, boxesHeight, 2, 2, "FD");

  let summaryY = bottomBlockY + 4.8;

  // 1. Subtotal
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal:", summaryX + 4, summaryY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(formatPrice(subtotal), summaryX + summaryWidth - 4, summaryY, { align: "right" });

  summaryY += 4.5;

  // 2. Discount (only if > 0)
  if (discountAmount > 0) {
    const discLabel =
      currentQuo.discount_type === "PERCENTAGE"
        ? `Discount (${currentQuo.discount}%):`
        : "Discount:";
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 185, 129);
    doc.text(discLabel, summaryX + 4, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`-${formatPrice(discountAmount)}`, summaryX + summaryWidth - 4, summaryY, { align: "right" });
    summaryY += 4.5;
  }

  // 3. Tax (only if > 0)
  if (taxAmount > 0) {
    const taxLabel =
      currentQuo.tax_type === "PERCENTAGE"
        ? `Tax / VAT (${currentQuo.tax}%):`
        : "Tax / VAT:";
    doc.setFont("helvetica", "normal");
    doc.setTextColor(217, 119, 6);
    doc.text(taxLabel, summaryX + 4, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`+${formatPrice(taxAmount)}`, summaryX + summaryWidth - 4, summaryY, { align: "right" });
    summaryY += 4.5;
  }

  // 4. Total Invoiced
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(3, 31, 76);
  doc.text("Total Invoiced:", summaryX + 4, summaryY);
  doc.setFontSize(8.5);
  doc.text(formatPrice(grandTotal), summaryX + summaryWidth - 4, summaryY, { align: "right" });

  summaryY += 3.8;

  // Divider inside summary
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(summaryX + 3, summaryY, summaryX + summaryWidth - 3, summaryY);
  summaryY += 4.0;

  // 5. Paid Amount
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Paid Amount:", summaryX + 4, summaryY);
  doc.setFont("helvetica", "bold");
  if (paidAmount > 0) {
    doc.setTextColor(16, 185, 129); // emerald-600
  } else {
    doc.setTextColor(100, 116, 139);
  }
  doc.text(formatPrice(paidAmount), summaryX + summaryWidth - 4, summaryY, { align: "right" });

  summaryY += 4.5;

  // 6. Remaining Amount Banner
  const remainingBoxHeight = 8;
  const isSettled = balance <= 0 && grandTotal > 0;

  if (isSettled) {
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200
    doc.setLineWidth(0.3);
    doc.roundedRect(summaryX + 3, summaryY - 0.5, summaryWidth - 6, remainingBoxHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text("REMAINING AMOUNT:", summaryX + 5.5, summaryY + 4.5);
    doc.setFontSize(8.5);
    doc.text(formatPrice(0), summaryX + summaryWidth - 5.5, summaryY + 4.5, { align: "right" });
  } else {
    doc.setFillColor(3, 31, 76); // Navy accent #031F4C
    doc.roundedRect(summaryX + 3, summaryY - 0.5, summaryWidth - 6, remainingBoxHeight, 1.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("REMAINING AMOUNT:", summaryX + 5.5, summaryY + 4.5);
    doc.setFontSize(8.5);
    doc.text(formatPrice(balance), summaryX + summaryWidth - 5.5, summaryY + 4.5, { align: "right" });
  }

  // 7. Terms & Notes below summary boxes (Strictly dynamic: only displayed when backend data exists)
  let postBoxesY = bottomBlockY + boxesHeight + 4;

  // Terms & Conditions - only if actual data received from backend
  if (rawTerms) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Terms & Conditions:", margin, postBoxesY);
    postBoxesY += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const splitTerms = doc.splitTextToSize(rawTerms, pageWidth - margin * 2);
    doc.text(splitTerms, margin, postBoxesY);
    postBoxesY += splitTerms.length * 3.2 + 2;
  }

  // Special Notes - if any notes data is available from backend, display below Terms & Conditions
  if (rawNotes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Special Notes & Instructions:", margin, postBoxesY);
    postBoxesY += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const splitNotes = doc.splitTextToSize(rawNotes, pageWidth - margin * 2);
    doc.text(splitNotes, margin, postBoxesY);
    postBoxesY += splitNotes.length * 3.2 + 2;
  }

  // Cheque Note - displayed below Terms & Conditions and Notes
  if (rawChequeNote) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const splitCheque = doc.splitTextToSize(`• ${rawChequeNote}`, pageWidth - margin * 2);
    doc.text(splitCheque, margin, postBoxesY);
    postBoxesY += splitCheque.length * 3.2 + 2;
  }

  // 8. Signatures & Footer (Rendered consistently on every page)
  const totalPages = doc.internal.getNumberOfPages();
  const footerCompanyName = contactDetails.companyName || "Shree Energy (Pvt) Ltd";

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 16;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `This is an official computer-generated invoice issued by ${footerCompanyName}.`,
      margin,
      footerY + 4.5
    );
    doc.text(
      `Authorized Finance Division${totalPages > 1 ? ` • Page ${i} of ${totalPages}` : ""}`,
      pageWidth - margin,
      footerY + 4.5,
      { align: "right" }
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 139, 215);

    const brandingParts = [];
    if (cleanWeb) brandingParts.push(cleanWeb);
    if (contactDetails.tagline) brandingParts.push(contactDetails.tagline);
    else brandingParts.push("Empowering Sri Lanka with Solar Clean Energy");

    doc.text(
      brandingParts.join(" • "),
      pageWidth / 2,
      footerY + 9,
      { align: "center" }
    );
  }

  // Output blob and file
  const blob = doc.output("blob");
  const fileName = `${invoiceNumber}.pdf`;
  const file = new File([blob], fileName, { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    doc,
    blob,
    file,
    url,
    invoiceNumber,
    grandTotal,
    subtotal,
    balance,
  };
}
