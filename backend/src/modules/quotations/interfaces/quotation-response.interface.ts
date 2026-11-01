import { QuotationEntity } from "../entities/quotation.entity";
import { PriceBreakdown } from "./price-breakdown.interface";

export interface QuotationResponse {
    quotation: QuotationEntity;
    price_breakdown: PriceBreakdown;
}