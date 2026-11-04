import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity, PaymentStatus } from './entities/invoice.entity';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { QuotationEntity, QuotationStatus } from '../quotations/entities/quotation.entity';
import { randomUUID } from 'crypto';
import { QuotationsService } from '../quotations/quotations.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { pick } from '../../utils/pick-fields.util';
import { Quotation_FIELDS } from '../quotations/constants/quotation-fields.constants';
import { QUOTATION_ITEM_SNAP_FIELDS } from '../quotations/quotation-items/constants/quotation-item-snap-fields.constants';
import { FindInvoicesQueryDto } from './dto/find-invoice-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { USER_FIELDS } from '../identity/constants/user-fields.constants';
import { CommunicationService } from '../../integrations/communication/communication.service';
import { FilesService } from '../files/files.service';
import { FILE_LOG_MESSAGES } from '../files/constants/file-errors.constants';
import { FILE_FIELDS } from '../files/constants/file-fields.constants';

const INVOICE_ALIAS = 'invoice';

const FRESHNESS_WINDOW_MS = 60_000;

const EXACT_FILTER_MAP: Partial<Record<keyof FindInvoicesQueryDto, string>> = {
    payment_status:     `${INVOICE_ALIAS}.payment_status`,
};

@Injectable()
export class InvoicesService {
    private readonly logger = new  Logger(InvoicesService.name);
    
    constructor(
        @InjectRepository(InvoiceEntity)
        private readonly invoiceRepo: Repository<InvoiceEntity>,

        private readonly quotationService: QuotationsService,
        private readonly mailService: CommunicationService,
        private readonly fileUploadService: FilesService,
    ) {}

    async generate(quotation: QuotationEntity, dto: CreateInvoiceDto): Promise<InvoiceEntity> {
        const exists = await this.invoiceRepo.existsBy({ quotation_id: quotation.id })
        if (exists) throw new ConflictException(`Invoice already generated for quotation: ${quotation.quotation_number}`);

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

    async updateToLatestPrices(quotation: QuotationEntity, invoice: InvoiceEntity): Promise<void> {
        await this.quotationService.updateSnapQuotation(quotation.id);
        await this.updatePriceBreakdown(quotation, invoice.id);

        await this.invoiceRepo.manager.transaction(async (manager: EntityManager) => {
            await manager.update(InvoiceEntity, invoice.id, { price_updated_at: Date.now() })
        });
    }

    async findById(invoice_id: string, is_latest: boolean = false): Promise<InvoiceEntity> {
        const invoice = await this.detailQueryBuilder()
            .where(`${INVOICE_ALIAS}.id = :id`, { id: invoice_id})
            .getOne();

        if (!invoice) throw new NotFoundException(`Invoice Not Found`);

        if (is_latest) {
            const updatedAt = invoice.price_updated_at?.getTime() ?? 0;
            const age = Date.now() - updatedAt;

            if (age > FRESHNESS_WINDOW_MS) {
                throw new BadRequestException('Please update invoice first');
            }
        }

        return invoice;
    }

    async findAllInvoices(query: FindInvoicesQueryDto): Promise<PaginatedResponse<InvoiceEntity>> {
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

        if (query.lowest_budget != null) {
            idQueryBuilder.andWhere(`${INVOICE_ALIAS}.total >= :lowest_budget`, { lowest_budget: query.lowest_budget });
        }
            
        if (query.maximum_budget != null) {
            idQueryBuilder.andWhere(`${INVOICE_ALIAS}.total <= :maximum_budget`, { maximum_budget: query.maximum_budget });
        }

        if (query.start_date != null) {
            idQueryBuilder.andWhere(`${INVOICE_ALIAS}.created_at >= :start_date`, { start_date: query.start_date });
        }

        if (query.end_date != null) {
            idQueryBuilder.andWhere(`${INVOICE_ALIAS}.created_at <= :end_date`, { end_date: query.end_date });
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

    async sendToCustomer(invoice: InvoiceEntity, pdf: Express.Multer.File): Promise<void> {
        const quotation = invoice.quotation;
        const customer = quotation?.customer;

        if (!quotation) {
            throw new BadRequestException('Quotation not found for this invoice');
        }

        if (!customer.email) {
            throw new BadRequestException('Customer email not found for this invoice');
        }

        if (quotation.status === QuotationStatus.REJECTED) {
            throw new BadRequestException(`Cannot send invoice: the quotation is ${invoice.quotation.status}`);
        }

        if (invoice.payment_status === PaymentStatus.PAID) {
            throw new BadRequestException(`${invoice.invoice_number} have completed full payment)}`);
        }

        const oldFileId = invoice.invoice_pdf_id;

        const uploadedFile = await this.fileUploadService.uploadFile(pdf, 'invoice-pdf');

        try {
            await this.invoiceRepo.manager.transaction(async (manager: EntityManager) => {
                await manager.update(InvoiceEntity, invoice.id, { invoice_pdf_id: uploadedFile.id });
            });
        } catch (error) {
            try {
                await this.fileUploadService.deleteFile(uploadedFile.id);
            } catch (rollbackError) {
                this.logger.error(
                    FILE_LOG_MESSAGES.UPDATE_ROLLBACK_FAILED(uploadedFile.id),
                    rollbackError instanceof Error ? rollbackError.stack : rollbackError,
                );
            }

            throw error;
        }

        if (oldFileId) {
            try {
                await this.fileUploadService.deleteFile(oldFileId);
            } catch (cleanupError) {
                this.logger.error(
                    FILE_LOG_MESSAGES.OLD_FILE_CLEANUP_FAILED(`Invoice ${invoice.id}`, oldFileId),
                    cleanupError instanceof Error ? cleanupError.stack : cleanupError,
                );
            }
        }

        await this.mailService.sendInvoiceEmail(
            customer.email,
            customer.name,
            invoice.invoice_number,
            pdf,
        );

        await this.quotationService.sentQuotation(invoice.quotation_id);
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

    private async updatePriceBreakdown(quotation: QuotationEntity, invoice_id: string): Promise<InvoiceEntity | undefined> {
        if (quotation.status === QuotationStatus.ACCEPTED || quotation.status === QuotationStatus.REJECTED) {
            return;
        }

        const priceBreakdown = await this.quotationService.getPriceBreakdown(quotation);

        return await this.invoiceRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(InvoiceEntity)
                .createQueryBuilder(INVOICE_ALIAS)
                .setLock('pessimistic_write')
                .where(`${INVOICE_ALIAS}.id = :id`, { id: invoice_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Invoice with ID ${invoice_id} not found`);

            const full = await manager.findOneOrFail(InvoiceEntity, {
                where: { id: locked.id },
                relations: { quotation: true },
            });

            if (full.quotation.status === QuotationStatus.ACCEPTED || full.quotation.status === QuotationStatus.REJECTED) {
                return full;
            }

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
        qb = this.withPdf(qb);

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

    private withPdf(qb: SelectQueryBuilder<InvoiceEntity>) {
        return qb
        .leftJoin(`${INVOICE_ALIAS}.invoice_pdf`, 'invoice_pdf')
        .addSelect(pick('invoice_pdf', FILE_FIELDS));
    }
}
