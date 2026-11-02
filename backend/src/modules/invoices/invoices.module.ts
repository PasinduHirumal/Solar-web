import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { QuotationsModule } from '../quotations/quotations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity]),
    QuotationsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService]
})
export class InvoicesModule {}
