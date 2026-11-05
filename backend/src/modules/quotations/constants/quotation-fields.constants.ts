import { QuotationEntity } from "../entities/quotation.entity";

export const QUOTATION_DETAIL_FIELDS: (keyof QuotationEntity)[] = [
    'id', 'quotation_number', 'status', 'notes', 'terms',
];

export const QUOTATION_CARD_FIELDS: (keyof QuotationEntity)[] = [
    'id', 'quotation_number',
];