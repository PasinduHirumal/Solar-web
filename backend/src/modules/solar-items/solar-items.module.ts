import { Module } from '@nestjs/common';
import { ItemsController } from './items/items.controller';
import { ItemsService } from './items/items.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCategoryEntity } from './categories/entities/item-category.entity';
import { ItemCategoryExistsPipe } from './categories/pipes/category-exists.pipe';
import { FilesModule } from '../files/files.module';
import { SolarItemEntity } from './items/entities/solar-items.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemCategoryEntity,
      SolarItemEntity,
    ]),
    FilesModule,
  ],
  controllers: [
    ItemsController, 
    CategoriesController,
  ],
  providers: [
    ItemsService, 
    CategoriesService, 
    ItemCategoryExistsPipe,
  ]
})
export class SolarItemsModule {}
