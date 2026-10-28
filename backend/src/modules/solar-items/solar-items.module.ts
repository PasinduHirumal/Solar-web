import { Module } from '@nestjs/common';
import { ItemsController } from './items/items.controller';
import { ItemsService } from './items/items.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCategoryEntity } from './categories/entities/item-category.entity';
import { ItemCategoryExistsPipe } from './categories/pipes/category-exists.pipe';
import { SolarItemEntity } from './items/entities/solar-items.entity';
import { SolarItemExistsPipe } from './items/pipes/solar-item-exists.pipe';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemCategoryEntity,
      SolarItemEntity,
    ])
  ],
  controllers: [
    ItemsController, 
    CategoriesController,
  ],
  providers: [
    ItemsService, 
    CategoriesService, 
    ItemCategoryExistsPipe,
    SolarItemExistsPipe,
  ]
})
export class SolarItemsModule {}
