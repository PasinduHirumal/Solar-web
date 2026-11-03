import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity, PaymentType } from './entities/payment.entity';
import { EntityManager, Repository } from 'typeorm';
import { InvoiceEntity, PaymentStatus } from '../invoices/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QuotationStatus } from '../quotations/entities/quotation.entity';
import { round } from '../../utils/math.round.util';
import { FindPaymentsQueryDto } from './dto/find-payment-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

const PAYMENT_ALIAS = 'payment';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(PaymentEntity)
        private readonly paymentRepo: Repository<PaymentEntity>,
    ) {}

    async payToInvoice(invoice: InvoiceEntity, dto: CreatePaymentDto): Promise<PaymentEntity> {
        if (invoice.quotation.status !== QuotationStatus.ACCEPTED) {
            throw new BadRequestException(`Invoice quotation not approved yet`);
        }

        const balance = invoice.total - invoice.paid_amount;

        if (balance < dto.amount) {
            throw new BadRequestException(`${invoice.invoice_number} have to pay only ${round(balance)}`);
        }

        const totalPaid = invoice.paid_amount + dto.amount;

        return await this.paymentRepo.manager.transaction(async (manager: EntityManager) => {
            const payment = manager.create(PaymentEntity, {
                ...dto,
                invoice_id: invoice.id,
            });

            await manager.update(InvoiceEntity, invoice.id, { 
                paid_amount: round(totalPaid),
                payment_status: 
                    dto.payment_type === PaymentType.ADVANCE ? PaymentStatus.ADVANCED :
                    dto.payment_type === PaymentType.PARTIAL ? PaymentStatus.PARTIAL :
                    PaymentStatus.PAID,
            });

            return await manager.save(PaymentEntity, payment);
        });
    }

    async findAllPayments(query: FindPaymentsQueryDto): Promise<PaginatedResponse<PaymentEntity>> {
        const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'DESC' } = query;
        const skip = (page - 1) * limit;

        const idQueryBuilder = this.paymentRepo
            .createQueryBuilder(PAYMENT_ALIAS)
            .select(`${PAYMENT_ALIAS}.id`)
            .addSelect(`${PAYMENT_ALIAS}.${sort_by}`)
            .distinct(true);

        idQueryBuilder.andWhere(`${PAYMENT_ALIAS}.invoice_id = :invoice_id`, { invoice_id: query.invoice_id });

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
                .orderBy(`${PAYMENT_ALIAS}.${sort_by}`, sort_order)
                .addOrderBy(`${PAYMENT_ALIAS}.id`, 'DESC')
                .skip(skip)
                .take(limit)
                .getMany()
        ).map((j) => j.id);

        if (ids.length === 0) return { items: [], meta };

        const items = await this.paymentRepo
            .createQueryBuilder(PAYMENT_ALIAS)
            .where(`${PAYMENT_ALIAS}.id IN (:...ids)`, { ids })
            .orderBy(`${PAYMENT_ALIAS}.${sort_by}`, sort_order)
            .addOrderBy(`${PAYMENT_ALIAS}.id`, 'DESC')
            .getMany();

        return { items, meta };
    }
}
