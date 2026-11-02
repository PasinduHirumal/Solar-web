import { QuotationItemEntity } from "../entities/quotation-item.entity";

export const QUOTATION_ITEM_FIELDS: (keyof QuotationItemEntity)[] = [
    'id', 'quotation_id', 'solar_item_id', 'quantity',
];