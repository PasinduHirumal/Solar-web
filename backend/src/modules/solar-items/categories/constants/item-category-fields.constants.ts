import { ItemCategoryEntity } from "../entities/item-category.entity";

export const CATEGORY_FIELDS: (keyof ItemCategoryEntity)[] = [
    'id', 'title', 'is_active', 'description',
];