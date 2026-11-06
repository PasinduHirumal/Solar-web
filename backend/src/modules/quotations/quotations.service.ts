import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { QuotationEntity, QuotationStatus } from './entities/quotation.entity';
import { randomUUID } from 'crypto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { AuthHelperService } from '../identity/auth/helpers/auth-helper.service';
import { UserRole } from '../identity/enums/user.enum';
import { QuotationItemEntity } from './quotation-items/entities/quotation-item.entity';
import { FindQuotationsQueryDto } from './dto/find-quotation-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { QuotationResponse } from './interfaces/quotation-response.interface';
import { pick } from '../../utils/pick-fields.util';
import { USER_FIELDS } from '../identity/constants/user-fields.constants';
import { SOLAR_ITEM_FIELDS } from '../solar-items/items/constants/solar-item-fields.constants';
import { CATEGORY_FIELDS } from '../solar-items/categories/constants/item-category-fields.constants';
import { ItemsService } from '../solar-items/items/items.service';
import { DiscountType } from '../../common/enums/discount-type.enum';
import { TaxType } from '../../common/enums/tax-type.enum';
import { UpdateQuotationDiscountDto } from './dto/update-quotation-discount.dto';
import { UpdateQuotationTaxDto } from './dto/update-quotation-tax.dto';
import { PriceBreakdown } from './interfaces/price-breakdown.interface';
import { UpdateQuotationDataDto } from './dto/update-quotation-data.dto';
import { QUOTATION_ITEM_FIELDS } from './quotation-items/constants/quotation-item-fields.constants';
import { round } from '../../utils/math.round.util';

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
        private readonly itemsService: ItemsService,
    ) {}

    async create(dto: CreateQuotationDto): Promise<QuotationEntity> {
        if (!dto.phone || !dto.address) {
            throw new BadRequestException(`Customer Phone-Number & Address are required`);
        }

        if (dto.discount_type && dto.discount_type === DiscountType.PERCENTAGE) {
            if(dto.discount >= 100) throw new BadRequestException(`Discount percentage cannot be over 100`);
            if(dto.discount <= 0) throw new BadRequestException(`Discount percentage cannot be less than 0`);
        }

        if (dto.discount_type && dto.discount_type === DiscountType.FIXED) {
            if(dto.discount <= 0) throw new BadRequestException(`Discount cannot be less than 0`);
        }

        if (dto.tax_type && dto.tax_type === TaxType.PERCENTAGE) {
            if(dto.tax >= 100) throw new BadRequestException(`Tax percentage cannot be over 100`);
            if(dto.tax <= 0) throw new BadRequestException(`Tax percentage cannot be less than 0`);
        }

        if (dto.tax_type && dto.tax_type === TaxType.FIXED) {
            if(dto.tax <= 0) throw new BadRequestException(`Tax cannot be less than 0`);
        }

        if (dto.item_ids.length > 10) {
            throw new BadRequestException(`Maximum 10 items can add at this time`);
        }

        const uniqueIds = [...new Set(dto.item_ids.map((i) => i.solar_item_id))];
        const found = await this.itemsService.getItemsByIds(uniqueIds);

        if (found.length !== uniqueIds.length) {
            const foundIds = new Set(found.map((s) => s.id));
            const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
            throw new NotFoundException(`Solar items not found: ${missingIds.join(', ')}`);
        }

        let customer = await this.authService.findEntityByEmailAndPhone(dto.email, dto.phone);

        if (customer && customer.role !== UserRole.USER) {
            throw new BadRequestException(`${customer.name} is an ${customer.role}, Cannot add ${customer.role} as customer`);
        }

        if (!customer || customer.email !== dto.email || customer.phone !== dto.phone) {
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
                customer_id: customer.id,
                quotation_number: quotationNumber,
                status: QuotationStatus.DRAFT,
                items: item_ids.map((i) => manager.create(QuotationItemEntity, { 
                    solar_item_id: i.solar_item_id, 
                    quantity: i.quantity,
                })),
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
                    customer.phone      LIKE :search
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

    async findWithPriceBreakdown(quotation: QuotationEntity): Promise<QuotationResponse> {
        const priceBreakdownResult = await this.getPriceBreakdown(quotation);

        return {
            quotation,
            price_breakdown: {
                subtotal: priceBreakdownResult.subtotal,
                discount: priceBreakdownResult.discount,
                tax: priceBreakdownResult.tax,
                total: priceBreakdownResult.total,
            }
        }
    }

    async updateData(quotation_id: string, dto: UpdateQuotationDataDto): Promise<QuotationEntity> {
        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(QuotationEntity)
                .createQueryBuilder(QUOTATION_ALIAS)
                .setLock('pessimistic_write')
                .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Quotation with ID ${quotation_id} not found`);

            if (locked.status !== QuotationStatus.DRAFT) {
                throw new BadRequestException(`Cannot update quotation in status: ${locked.status} `);
            }

            await manager.update(QuotationEntity, locked.id, dto);
            return await manager.findOneOrFail(QuotationEntity, { where: { id: locked.id }});
        });
    }

    async updateDiscount(quotation_id: string, dto: UpdateQuotationDiscountDto): Promise<QuotationEntity> {
        if (dto.discount_type === DiscountType.PERCENTAGE) {
            if(dto.discount >= 100) throw new BadRequestException(`Discount percentage cannot be over 100`);
            if(dto.discount <= 0) throw new BadRequestException(`Discount percentage cannot be less than 0`);
        }

        if (dto.discount_type === DiscountType.FIXED) {
            if(dto.discount <= 0) throw new BadRequestException(`Discount cannot be less than 0`);
        }

        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(QuotationEntity)
                .createQueryBuilder(QUOTATION_ALIAS)
                .setLock('pessimistic_write')
                .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Quotation with ID ${quotation_id} not found`);

            if (locked.status !== QuotationStatus.DRAFT) {
                throw new BadRequestException(`Cannot update discount for quotation in status: ${locked.status} `);
            }

            await manager.update(QuotationEntity, locked.id, dto);
            return await manager.findOneOrFail(QuotationEntity, { where: { id: locked.id }});
        });
    }

    async updateTax(quotation_id: string, dto: UpdateQuotationTaxDto): Promise<QuotationEntity> {
        if (dto.tax_type === TaxType.PERCENTAGE) {
            if(dto.tax >= 100) throw new BadRequestException(`Tax percentage cannot be over 100`);
            if(dto.tax <= 0) throw new BadRequestException(`Tax percentage cannot be less than 0`);
        }

        if (dto.tax_type === TaxType.FIXED) {
            if(dto.tax <= 0) throw new BadRequestException(`Tax cannot be less than 0`);
        }

        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(QuotationEntity)
                .createQueryBuilder(QUOTATION_ALIAS)
                .setLock('pessimistic_write')
                .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Quotation with ID ${quotation_id} not found`);

            if (locked.status !== QuotationStatus.DRAFT) {
                throw new BadRequestException(`Cannot update tax for quotation in status: ${locked.status} `);
            }

            await manager.update(QuotationEntity, locked.id, dto);
            return await manager.findOneOrFail(QuotationEntity, { where: { id: locked.id }});
        });
    }

    async acceptQuotation(quotation_id: string): Promise<QuotationEntity> {
        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(QuotationEntity)
                .createQueryBuilder(QUOTATION_ALIAS)
                .setLock('pessimistic_write')
                .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Quotation with ID ${quotation_id} not found`);

            if (locked.status !== QuotationStatus.SENT) {
                throw new BadRequestException(`Cannot accept quotation, please send invoice to customer first`);
            }

            await manager.update(QuotationEntity, locked.id, { status: QuotationStatus.ACCEPTED });
            return await manager.findOneOrFail(QuotationEntity, { where: { id: locked.id }});
        });
    }

    async rejectQuotation(quotation_id: string): Promise<QuotationEntity> {
        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(QuotationEntity)
                .createQueryBuilder(QUOTATION_ALIAS)
                .setLock('pessimistic_write')
                .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Quotation with ID ${quotation_id} not found`);

            if (locked.status !== QuotationStatus.SENT) {
                throw new BadRequestException(`Cannot reject quotation, please send invoice to customer first`);
            }

            await manager.update(QuotationEntity, locked.id, { status: QuotationStatus.REJECTED });
            return await manager.findOneOrFail(QuotationEntity, { where: { id: locked.id }});
        });
    }

    async sentQuotation(quotation_id: string): Promise<QuotationEntity> {
        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(QuotationEntity)
                .createQueryBuilder(QUOTATION_ALIAS)
                .setLock('pessimistic_write')
                .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Quotation with ID ${quotation_id} not found`);

            if (locked.status !== QuotationStatus.DRAFT && locked.status !== QuotationStatus.SENT) {
                throw new BadRequestException(`Cannot sent quotation in status: ${locked.status} `);
            }

            await manager.update(QuotationEntity, locked.id, { status: QuotationStatus.SENT });
            return await manager.findOneOrFail(QuotationEntity, { where: { id: locked.id }});
        });
    }

    async remove(quotation: QuotationEntity): Promise<void> {
        if (quotation.status !== QuotationStatus.DRAFT) {
            throw new BadRequestException(`Cannot delete quotation in status: ${quotation.status} `);
        }

        try {
            await this.quotationRepo
                .createQueryBuilder()
                .delete()
                .from(QuotationEntity)
                .where('id = :id', { id: quotation.id })
                .execute();
        } catch (error) {
            throw new BadRequestException(`Cannot delete quotation "${quotation.quotation_number}" — it is still assigned to one or more records`);
        }
    }


    // helper methods
    async findById(quotation_id: string): Promise<QuotationEntity> {
        const quotation = await this.detailQueryBuilder()
            .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation_id})
            .getOne();

        if (!quotation) throw new NotFoundException(`Quotation Not Found`);

        return quotation;
    }

    async updateSnapQuotation(quotation_id: string): Promise<QuotationEntity> {
        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(QuotationEntity)
                .createQueryBuilder(QUOTATION_ALIAS)
                .setLock('pessimistic_write')
                .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation_id })
                .getOne();

            if (!locked) throw new NotFoundException(`Quotation with ID ${quotation_id} not found`);

            if (locked.status === QuotationStatus.ACCEPTED || locked.status === QuotationStatus.REJECTED) {
                return locked;
            }

            const items = await manager.find(QuotationItemEntity, {
                where: { quotation_id: locked.id },
                relations: { solar_item: true },
            });

            if (!items.length) {
                throw new BadRequestException(`Cannot accept a quotation with no items`);
            }

            const inactive = items.filter((i) => !i.solar_item?.is_active);
            if (inactive.length) {
                throw new BadRequestException(
                    `Cannot accept: items no longer available: ${inactive.map((i) => i.solar_item_id).join(', ')}`,
                );
            }

            for (const item of items) {
                await manager.update(QuotationItemEntity, item.id, {
                    snap_code: item.solar_item.code,
                    snap_title: item.solar_item.title,
                    snap_warranty_period: item.solar_item.warranty_period,
                    snap_warranty_details: item.solar_item.warranty_details,
                    snap_selling_price: item.solar_item.selling_price,
                });
            }

            await manager.update(QuotationEntity, locked.id, { status: QuotationStatus.DRAFT });
            return await manager.findOneOrFail(QuotationEntity, { where: { id: locked.id }});
        });
    }

    async getPriceBreakdown(quotation: QuotationEntity): Promise<PriceBreakdown> {
        const subtotal = await this.calculateSubtotal(quotation);

        let discount: number = 0;
        if (quotation.discount_type === DiscountType.FIXED) {
            discount = quotation.discount;
        } else if (quotation.discount_type === DiscountType.PERCENTAGE) {
            discount = (subtotal * (quotation.discount / 100));
        }

        let tax: number = 0;
        if (quotation.tax_type === TaxType.FIXED) {
            tax = quotation.tax;
        } else if (quotation.tax_type === TaxType.PERCENTAGE) {
            tax = (subtotal * (quotation.tax / 100));
        }

        return {
            subtotal: round(subtotal),
            discount: round(discount),
            tax: round(tax),
            total: round(subtotal - discount + tax),
        }
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

    private async calculateSubtotal(quotation: QuotationEntity): Promise<number> {
        if (!quotation.items?.length) return 0;

        if (quotation.status === QuotationStatus.ACCEPTED || quotation.status === QuotationStatus.REJECTED) {
            return quotation.items.reduce((sum, i) => {
                if (i.snap_selling_price === null) {
                    throw new InternalServerErrorException(
                        `Approved quotation ${quotation.id} has item ${i.id} without a price snapshot`,
                    );
                }
                return sum + i.snap_selling_price * i.quantity;
            }, 0);
        }

        // Draft: use live prices
        return quotation.items.reduce((sum, i) => {
            if (!i.solar_item?.is_active) {
                throw new BadRequestException(
                    `Solar item ${i.solar_item_id} is inactive or missing; update the quotation`,
                );
            }
            return sum + i.solar_item.selling_price * i.quantity;
        }, 0);
    }


    // query-builders
    private cardQueryBuilder() {
        let qb = this.quotationRepo.createQueryBuilder(QUOTATION_ALIAS);
        qb = this.withCustomer(qb);
        
        return qb;
    }

    private detailQueryBuilder() {
        let qb = this.quotationRepo.createQueryBuilder(QUOTATION_ALIAS);
        qb = this.withCustomer(qb);
        qb = this.withItems(qb);

        return qb;
    }

    private withCustomer(qb: SelectQueryBuilder<QuotationEntity>) {
        return qb
            .innerJoin(`${QUOTATION_ALIAS}.customer`, 'customer')
            .addSelect(pick('customer', USER_FIELDS));
    }

    private withItems(qb: SelectQueryBuilder<QuotationEntity>) {
        return qb
            .leftJoin(`${QUOTATION_ALIAS}.items`, `quo_item`)
            .addSelect(pick('quo_item', QUOTATION_ITEM_FIELDS))
            .leftJoin('quo_item.solar_item', 'solar_item')
            .addSelect(pick('solar_item', SOLAR_ITEM_FIELDS))
            .innerJoin(`solar_item.category`, 'category')
            .addSelect(pick('category', CATEGORY_FIELDS));
    }
}
