import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { QuotationItemsController } from './quotation-items/quotation-items.controller';
import { QuotationItemsService } from './quotation-items/quotation-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationItemEntity } from './quotation-items/entities/quotation-item.entity';
import { QuotationEntity } from './entities/quotation.entity';
import { IdentityModule } from '../identity/identity.module';
import { SolarItemsModule } from '../solar-items/solar-items.module';
import { QuotationExistsPipe } from './pipes/quotation-exists.pipe';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuotationItemEntity,
      QuotationEntity,
    ]),
    IdentityModule,
    SolarItemsModule,
  ],
  controllers: [
    QuotationsController, 
    QuotationItemsController,
  ],
  providers: [
    QuotationsService, 
    QuotationItemsService,
    QuotationExistsPipe,
  ]
})
export class QuotationsModule {}
