import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { EntityManager, Repository } from 'typeorm';
import { QuotationEntity } from '../quotations/entities/quotation.entity';
import { randomUUID } from 'crypto';
import { QuotationsService } from '../quotations/quotations.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(InvoiceEntity)
        private readonly invoiceRepo: Repository<InvoiceEntity>,

        private readonly quotationService: QuotationsService,
    ) {}

    async generate(quotation: QuotationEntity, dto: CreateInvoiceDto): Promise<InvoiceEntity> {
        const invoiceNumber = await this.generateInvoiceNumber(quotation.customer.name);

        const priceBreakdown = await this.quotationService.getPriceBreakdown(quotation);

        return await this.invoiceRepo.manager.transaction(async (manager: EntityManager) => {
            const invoice = manager.create(InvoiceEntity, {
                ...dto,
                invoice_number: invoiceNumber,
                quotation_id: quotation.id,
                is_need_to_re_generate: true,
                subtotal: priceBreakdown.subtotal,
                discount: priceBreakdown.discount,
                tax: priceBreakdown.tax,
                total: priceBreakdown.total,
            });

            return await manager.save(InvoiceEntity, invoice);
        });
    }


    // helpers
    private async generateInvoiceNumber(customer_name: string): Promise<string> {
        const orgPrefix = `SO-INV`;
        const customerPrefix = customer_name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');

        for (let attempt = 0; attempt < 5; attempt++) {
            const suffix = randomUUID().split('-')[0].toUpperCase();
            const code = `${orgPrefix}-${customerPrefix}-${suffix}`;

            const exists = await this.invoiceRepo.existsBy({ invoice_number: code });
            if (!exists) return code;
        }

        throw new BadRequestException('Failed to generate a unique invoice number, please try again');
    }
}
