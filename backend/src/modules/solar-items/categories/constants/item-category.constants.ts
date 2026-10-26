import { ItemCategoryEntity } from "../entities/item-category.entity";

export const DEFAULT_SOLAR_ITEM_CATEGORY_VALUES: Pick<ItemCategoryEntity, 'title' | 'description'>[] = [
    {
        title: 'Battery Collection',
        description: 'Solar batteries for energy storage.',
    },
    {
        title: 'Solar Cells Collection',
        description: 'Solar cells for converting sunlight into electricity.',
    },
];