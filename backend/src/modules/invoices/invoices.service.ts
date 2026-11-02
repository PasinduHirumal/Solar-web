import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { QuotationEntity } from '../quotations/entities/quotation.entity';
import { randomUUID } from 'crypto';
import { QuotationsService } from '../quotations/quotations.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { pick } from '../../utils/pick-fields.util';
import { Quotation_FIELDS } from '../quotations/constants/quotation-fields.constants';
import { QUOTATION_ITEM_SNAP_FIELDS } from '../quotations/quotation-items/constants/quotation-item-snap-fields.constants';
import { FindInvoicesQueryDto } from './dto/find-invoice-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { USER_FIELDS } from '../identity/constants/user-fields.constants';

const INVOICE_ALIAS = 'invoice';

const EXACT_FILTER_MAP: Partial<Record<keyof FindInvoicesQueryDto, string>> = {
    payment_status:     `${INVOICE_ALIAS}.payment_status`,
};

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

    async findWithPriceBreakdown(quotation: QuotationEntity, invoice: InvoiceEntity): Promise<InvoiceEntity> {
        await this.quotationService.sentQuotation(quotation.id);
        await this.updatePriceBreakdown(quotation, invoice.id);

        return await this.findById(invoice.id);
    }

    async findAll(query: FindInvoicesQueryDto): Promise<PaginatedResponse<InvoiceEntity>> {
        const { page = 1, limit = 10, search_term, sort_by = 'created_at', sort_order = 'DESC' } = query;
        const skip = (page - 1) * limit;

        const idQueryBuilder = this.invoiceRepo
            .createQueryBuilder(INVOICE_ALIAS)
            .select(`${INVOICE_ALIAS}.id`)
            .addSelect(`${INVOICE_ALIAS}.${sort_by}`)
            .distinct(true);

        if (search_term) {
            const escaped = search_term.replace(/[\\%_]/g, '\\$&');

            idQueryBuilder
                .innerJoin(`${INVOICE_ALIAS}.quotation`, `quotation`)
                .innerJoin(`quotation.customer`, `customer`)
                .andWhere(
                `(
                    ${INVOICE_ALIAS}.invoice_number       LIKE :search OR
                    customer.email      LIKE :search OR
                    customer.name       LIKE :search OR
                    customer.phone      LIKE :search
                )`, 
                { search: `%${escaped}%` }
            );
        }

        for (const [key, column] of Object.entries(EXACT_FILTER_MAP)) {
            const value = query[key as keyof FindInvoicesQueryDto];
            if (value != null) {
                idQueryBuilder.andWhere(`${column} = :${key}`, { [key]: value });
            }
        }

        const totalItems = await idQueryBuilder.clone().getCount();
        const totalPages = Math.ceil(totalItems / limit);

        const meta = {
            currentPage: page,
            itemsPerPage: limit,
            totalItems,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
        };

        if (totalItems === 0 || skip >= totalItems) {
            return { items: [], meta };
        }

        const ids = (
            await idQueryBuilder
                .orderBy(`${INVOICE_ALIAS}.${sort_by}`, sort_order)
                .addOrderBy(`${INVOICE_ALIAS}.id`, 'DESC')
                .skip(skip)
                .take(limit)
                .getMany()
        ).map((j) => j.id);

        if (ids.length === 0) return { items: [], meta };

        const items = await this.cardQueryBuilder()
            .where(`${INVOICE_ALIAS}.id IN (:...ids)`, { ids })
            .orderBy(`${INVOICE_ALIAS}.${sort_by}`, sort_order)
            .addOrderBy(`${INVOICE_ALIAS}.id`, 'DESC')
            .getMany();

        return { items, meta };
    }


    // helper methods
    async findById(invoice_id: string): Promise<InvoiceEntity> {
        const invoice = await this.detailQueryBuilder()
            .where(`${INVOICE_ALIAS}.id = :id`, { id: invoice_id})
            .getOne();

        if (!invoice) throw new NotFoundException(`Invoice Not Found`);

        return invoice;
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

    private async updatePriceBreakdown(quotation: QuotationEntity, invoice_id: string): Promise<InvoiceEntity> {
        const priceBreakdown = await this.quotationService.getPriceBreakdown(quotation);

        return await this.invoiceRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(InvoiceEntity)
                .createQueryBuilder(INVOICE_ALIAS)
                .setLock('pessimistic_write')
                .where(`${INVOICE_ALIAS}.id = :id`, { id: invoice_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Invoice with ID ${invoice_id} not found`);

            await manager.update(InvoiceEntity, locked.id, {
                subtotal: priceBreakdown.subtotal,
                discount: priceBreakdown.discount,
                tax: priceBreakdown.tax,
                total: priceBreakdown.total,
            });

            return await manager.findOneOrFail(InvoiceEntity, { where: { id: locked.id }});
        });
    }


    // query-builders
    private cardQueryBuilder() {
        let qb = this.invoiceRepo.createQueryBuilder(INVOICE_ALIAS);
        return qb;
    }

    private detailQueryBuilder() {
        let qb = this.invoiceRepo.createQueryBuilder(INVOICE_ALIAS);
        qb = this.withQuotation(qb);

        return qb;
    }

    private withQuotation(qb: SelectQueryBuilder<InvoiceEntity>) {
        return qb
        .innerJoin(`${INVOICE_ALIAS}.quotation`, 'quotation')
        .addSelect(pick('quotation', Quotation_FIELDS))
        .innerJoin('quotation.customer', 'customer')
        .addSelect(pick('customer', USER_FIELDS))
        .leftJoin(`quotation.items`, `quo_item`)
        .addSelect(pick('quo_item', QUOTATION_ITEM_SNAP_FIELDS));
    }
}
