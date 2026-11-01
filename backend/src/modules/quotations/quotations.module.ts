import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { QuotationItemsController } from './quotation-items/quotation-items.controller';
import { QuotationItemsService } from './quotation-items/quotation-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationItemEntity } from './quotation-items/entities/quotation-item.entity';
import { QuotationEntity } from './entities/quotation.entity';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuotationItemEntity,
      QuotationEntity,
    ]),
    IdentityModule,
  ],
  controllers: [
    QuotationsController, 
    QuotationItemsController,
  ],
  providers: [
    QuotationsService, 
    QuotationItemsService,
  ]
})
export class QuotationsModule {}
