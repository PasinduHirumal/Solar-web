import { QuotationEntity } from "../entities/quotation.entity";

export const Quotation_FIELDS: (keyof QuotationEntity)[] = [
    'id', 'quotation_number', 'status', 'notes', 'terms',
];