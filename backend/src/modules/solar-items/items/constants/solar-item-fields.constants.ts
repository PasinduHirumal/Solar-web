import { SolarItemEntity } from "../entities/solar-items.entity";

export const SOLAR_ITEM_FIELDS: (keyof SolarItemEntity)[] = [
    'id', 'code', 'title', 'warranty_period', 'warranty_details', 'description', 'selling_price', 'is_active',
];