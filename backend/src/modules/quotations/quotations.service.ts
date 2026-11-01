import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { QuotationEntity, QuotationStatus } from './entities/quotation.entity';
import { randomUUID } from 'crypto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { AuthHelperService } from '../identity/auth/helpers/auth-helper.service';
import { UserRole } from '../identity/enums/user.enum';
import { QuotationItemEntity } from './quotation-items/entities/quotation-item.entity';
import { FindQuotationsQueryDto } from './dto/find-quotation-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

const QUOTATION_ALIAS = 'quotation';

const EXACT_FILTER_MAP: Partial<Record<keyof FindQuotationsQueryDto, string>> = {
    status:     `${QUOTATION_ALIAS}.status`,
};

@Injectable()
export class QuotationsService {
    constructor(
        @InjectRepository(QuotationEntity)
        private readonly quotationRepo: Repository<QuotationEntity>,

        private readonly authService: AuthHelperService,
    ) {}

    async create(dto: CreateQuotationDto): Promise<QuotationEntity> {
        if (!dto.phone || !dto.address) {
            throw new BadRequestException(`Customer Phone-Number & Address are required`);
        }

        let customer = await this.authService.findEntityByEmail(dto.email);

        if (!customer) {
            customer = await this.authService.createUserBySystem(
                {
                    email: dto.email,
                    name: dto.name,
                    role: UserRole.USER,
                    phone: dto.phone,
                    address: dto.address,
                },
                {
                    googleId: null,
                    isAnonymous: true,
                    mustChangePassword: true,
                }
            );
        }

        const quotationNumber = await this.generateQuotationNumber(customer.name);

        const { email, name, phone, address, item_ids, ...restDto } = dto;

        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const quotation = manager.create(QuotationEntity, {
                ...restDto,
                quotation_number: quotationNumber,
                status: QuotationStatus.DRAFT,
                items: item_ids.map((i) => manager.create(QuotationItemEntity, { solar_item_id: i.solar_item_id, quantity: i.quantity })),
            });

            return await manager.save(QuotationEntity, quotation);
        });
    }

    async findAll(query: FindQuotationsQueryDto): Promise<PaginatedResponse<QuotationEntity>> {
        const { page = 1, limit = 10, search_term, sort_by = 'created_at', sort_order = 'DESC' } = query;
        const skip = (page - 1) * limit;

        const idQueryBuilder = this.quotationRepo
            .createQueryBuilder(QUOTATION_ALIAS)
            .select(`${QUOTATION_ALIAS}.id`)
            .addSelect(`${QUOTATION_ALIAS}.${sort_by}`)
            .distinct(true);

        if (search_term) {
            const escaped = search_term.replace(/[\\%_]/g, '\\$&');

            idQueryBuilder
                .leftJoin(`${QUOTATION_ALIAS}.customer`, `customer`)
                .andWhere(
                `(
                    ${QUOTATION_ALIAS}.quotation_number       LIKE :search OR
                    customer.email      LIKE :search OR
                    customer.name       LIKE :search OR
                    customer.phone      LIKE :search OR
                )`, 
                { search: `%${escaped}%` }
            );
        }

        for (const [key, column] of Object.entries(EXACT_FILTER_MAP)) {
            const value = query[key as keyof FindQuotationsQueryDto];
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
                .orderBy(`${QUOTATION_ALIAS}.${sort_by}`, sort_order)
                .addOrderBy(`${QUOTATION_ALIAS}.id`, 'DESC')
                .skip(skip)
                .take(limit)
                .getMany()
        ).map((j) => j.id);

        if (ids.length === 0) return { items: [], meta };

        const items = await this.cardQueryBuilder()
            .where(`${QUOTATION_ALIAS}.id IN (:...ids)`, { ids })
            .orderBy(`${QUOTATION_ALIAS}.${sort_by}`, sort_order)
            .addOrderBy(`${QUOTATION_ALIAS}.id`, 'DESC')
            .getMany();

        return { items, meta };
    }


    // helpers
    private async generateQuotationNumber(customer_name: string): Promise<string> {
        const orgPrefix = `SO-QU`;
        const customerPrefix = customer_name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');

        for (let attempt = 0; attempt < 5; attempt++) {
            const suffix = randomUUID().split('-')[0].toUpperCase();
            const code = `${orgPrefix}-${customerPrefix}-${suffix}`;

            const exists = await this.quotationRepo.existsBy({ quotation_number: code });
            if (!exists) return code;
        }

        throw new BadRequestException('Failed to generate a unique quotation number, please try again');
    }


    // query-builders
    private cardQueryBuilder() {
        let qb = this.quotationRepo.createQueryBuilder(QUOTATION_ALIAS);
        return qb;
    }
}
