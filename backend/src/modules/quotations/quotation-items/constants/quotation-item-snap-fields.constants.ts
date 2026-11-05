import { QuotationItemEntity } from "../entities/quotation-item.entity";

export const QUOTATION_ITEM_SNAP_FIELDS: (keyof QuotationItemEntity)[] = [
    'id', 'quotation_id', 'solar_item_id', 'quantity', 'snap_code',
    'snap_title', 'snap_warranty_period', 'snap_warranty_details', 'snap_selling_price',
];