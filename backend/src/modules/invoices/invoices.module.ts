import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { QuotationsModule } from '../quotations/quotations.module';
import { InvoiceExistsPipe } from './pipes/invoice-exists.pipe';
import { CommunicationModule } from '../../integrations/communication/communication.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity]),
    QuotationsModule,
    CommunicationModule,
    FilesModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoiceExistsPipe],
  exports: [InvoicesService, InvoiceExistsPipe]
})
export class InvoicesModule {}
