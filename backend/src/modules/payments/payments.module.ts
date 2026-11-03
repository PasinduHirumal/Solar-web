import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]), 
    InvoicesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
