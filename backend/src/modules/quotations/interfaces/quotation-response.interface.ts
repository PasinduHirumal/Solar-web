import { QuotationEntity } from "../entities/quotation.entity";

export interface QuotationResponse {
    quotation: QuotationEntity;
    price_breakdown: {
        subtotal: number;
        discount: number;
        tax: number;
        total: number;
    };
}