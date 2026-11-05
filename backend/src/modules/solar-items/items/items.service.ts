import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolarItemEntity } from './entities/solar-items.entity';
import { EntityManager, In, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateSolarItemDto } from './dto/create-solar-item.dto';
import { randomUUID } from 'crypto';
import { CategoriesService } from '../categories/categories.service';
import { FindSolarItemsQueryDto } from './dto/find-solar-items-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { pick } from '../../../utils/pick-fields.util';
import { CATEGORY_FIELDS } from '../categories/constants/item-category-fields.constants';
import { UpdateSolarItemDto } from './dto/update-solar-item.dto';
import { UpdatePriceDto } from '../../../common/dto/inventory/update-price.dto';
import { UserEntity } from '../../identity/entities/user.entity';
import { UserRole } from '../../identity/enums/user.enum';

const SOLAR_ITEMS_ALIAS = 'solar_items';

const EXACT_FILTER_MAP: Partial<Record<keyof FindSolarItemsQueryDto, string>> = {
    is_active:              `${SOLAR_ITEMS_ALIAS}.is_active`,
    category_id:            `${SOLAR_ITEMS_ALIAS}.category_id`,
};

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(SolarItemEntity)
        private readonly solarItemRepo: Repository<SolarItemEntity>,

        private readonly categoryService: CategoriesService,
    ) {}

    async create(dto: CreateSolarItemDto, admin: UserEntity): Promise<SolarItemEntity> {
        const category = await this.categoryService.findById(dto.category_id);
        if (!category.is_active) throw new BadRequestException(`Category not in active`);

        const exists = await this.solarItemRepo.existsBy({ category_id: category.id, title: dto.title });
        if (exists) throw new ConflictException(`Solar-Item already exists with category: ${category.title} & title: ${dto.title}`);

        const solarItemCode = await this.generateItemCode(dto.title);

        try {
            return await this.solarItemRepo.manager.transaction(async (manager: EntityManager) => {
                const solarItem = manager.create(SolarItemEntity, {
                    ...dto,
                    code: solarItemCode,
                    category_id: category.id,
                    selling_price: dto.marked_price,
                    is_active: admin.role === UserRole.SUPER_ADMIN ? true : false,
                });

                return await manager.save(SolarItemEntity, solarItem);
            });
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: FindSolarItemsQueryDto): Promise<PaginatedResponse<SolarItemEntity>> {
        const { page = 1, limit = 10, search_term, sort_by = 'created_at', sort_order = 'DESC' } = query;
        const skip = (page - 1) * limit;

        const idQueryBuilder = this.solarItemRepo
            .createQueryBuilder(SOLAR_ITEMS_ALIAS)
            .select(`${SOLAR_ITEMS_ALIAS}.id`)
            .addSelect(`${SOLAR_ITEMS_ALIAS}.${sort_by}`)
            .distinct(true);

        if (search_term) {
            const escaped = search_term.replace(/[\\%_]/g, '\\$&');

            idQueryBuilder
                .andWhere(
                `(
                    ${SOLAR_ITEMS_ALIAS}.code       LIKE :search OR
                    ${SOLAR_ITEMS_ALIAS}.title      LIKE :search
                )`, 
                { search: `%${escaped}%` }
            );
        }

        for (const [key, column] of Object.entries(EXACT_FILTER_MAP)) {
            const value = query[key as keyof FindSolarItemsQueryDto];
            if (value != null) {
                idQueryBuilder.andWhere(`${column} = :${key}`, { [key]: value });
            }
        }

        if (query.lowest_budget != null) {
            idQueryBuilder.andWhere(`${SOLAR_ITEMS_ALIAS}.selling_price >= :lowest_budget`, { lowest_budget: query.lowest_budget });
        }
            
        if (query.maximum_budget != null) {
            idQueryBuilder.andWhere(`${SOLAR_ITEMS_ALIAS}.selling_price <= :maximum_budget`, { maximum_budget: query.maximum_budget });
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
                .orderBy(`${SOLAR_ITEMS_ALIAS}.${sort_by}`, sort_order)
                .addOrderBy(`${SOLAR_ITEMS_ALIAS}.id`, 'DESC')
                .skip(skip)
                .take(limit)
                .getMany()
        ).map((j) => j.id);

        if (ids.length === 0) return { items: [], meta };

        const items = await this.cardQueryBuilder()
            .where(`${SOLAR_ITEMS_ALIAS}.id IN (:...ids)`, { ids })
            .orderBy(`${SOLAR_ITEMS_ALIAS}.${sort_by}`, sort_order)
            .addOrderBy(`${SOLAR_ITEMS_ALIAS}.id`, 'DESC')
            .getMany();

        return { items, meta };
    }

    async findById(item_id: string): Promise<SolarItemEntity> {
        const solarItem = await this.detailQueryBuilder()
            .where(`${SOLAR_ITEMS_ALIAS}.id = :id`, { id: item_id})
            .getOne();

        if (!solarItem) throw new NotFoundException(`Solar-Item not found`);

        return solarItem;
    }

    async updateData(item: SolarItemEntity, dto: UpdateSolarItemDto): Promise<SolarItemEntity> {
        if (dto.category_id) {
            const category = await this.categoryService.findById(dto.category_id);
            if (!category.is_active) throw new BadRequestException(`Category not in active`);
        }

        if (dto.title || dto.category_id) {
            const exists = await this.solarItemRepo.existsBy({ 
                category_id: dto.category_id ?? item.category_id, 
                title: dto.title ?? item.title,
                id: Not(item.id),
            });

            if (exists) throw new ConflictException(`Cannot update, Solar-Item already exists with these data`);
        }

        return await this.solarItemRepo.manager.transaction(async (manager: EntityManager) => {
            await manager.update(SolarItemEntity, item.id, dto);
            return manager.findOneOrFail(SolarItemEntity, { where: { id: item.id } });
        });
    }

    async updatePrice(item: SolarItemEntity, dto: UpdatePriceDto): Promise<SolarItemEntity> {
        return await this.solarItemRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(SolarItemEntity)
                .createQueryBuilder(SOLAR_ITEMS_ALIAS)
                .setLock('pessimistic_write')
                .where(`${SOLAR_ITEMS_ALIAS}.id = :id`, { id: item.id })
                .getOne();

            if (!locked) throw new NotFoundException(`Solar-Item with ID ${item.id} not found`);

            await manager.update(SolarItemEntity, locked.id, {
                marked_price: dto.price,
                selling_price: dto.price,
            });

            return await manager.findOneOrFail(SolarItemEntity, {
                where: { id: locked.id },
            });
        });
    }

    async toggleStatus(item: SolarItemEntity): Promise<SolarItemEntity> {
        await this.solarItemRepo
            .createQueryBuilder()
            .update(SolarItemEntity)
            .set({ is_active: () => 'NOT is_active' })
            .where('id = :id', { id: item.id })
            .execute();

        return this.findById(item.id);
    }

    async remove(item: SolarItemEntity): Promise<void> {
        try {
            await this.solarItemRepo
                .createQueryBuilder()
                .delete()
                .from(SolarItemEntity)
                .where('id = :id', { id: item.id })
                .execute();
        } catch (error) {
            throw new BadRequestException(`Cannot delete solar-item "${item.code}" — it is still assigned to one or more records`);
        }
    }


    // helper methods
    async getTotalPriceForItems(item_ids: string[]): Promise<number> {
        if (!item_ids?.length) return 0;

        const uniqueIds = [...new Set(item_ids)];

        const result = await this.solarItemRepo
            .createQueryBuilder('item')
            .select('COALESCE(SUM(item.selling_price), 0)', 'total')
            .where('item.id IN (:...uniqueIds)', { uniqueIds })
            .andWhere('item.is_active = :active', { active: true })
            .getRawOne<{ total: string | number }>();

        return Math.round(Number(result?.total ?? 0) * 100) / 100;
    }

    async getItemsByIds(item_ids: string[]): Promise<SolarItemEntity[]> {
        if (!item_ids?.length) return [];

        const uniqueIds = [...new Set(item_ids)];
        
        return this.solarItemRepo
            .createQueryBuilder('item')
            .where('item.id IN (:...uniqueIds)', { uniqueIds })
            .getMany();
    }


    // helpers
    private async generateItemCode(title: string): Promise<string> {
        const orgPrefix = `SO`;
        const titlePrefix = title.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');

        for (let attempt = 0; attempt < 5; attempt++) {
            const suffix = randomUUID().split('-')[0].toUpperCase();
            const code = `${orgPrefix}-${titlePrefix}-${suffix}`;

            const exists = await this.solarItemRepo.existsBy({ code: code });
            if (!exists) return code;
        }

        throw new BadRequestException('Failed to generate a unique solar-item code, please try again');
    }


    // query-builders
    private cardQueryBuilder() {
        let qb = this.solarItemRepo.createQueryBuilder(SOLAR_ITEMS_ALIAS);
        return qb;
    }

    private detailQueryBuilder() {
        let qb = this.solarItemRepo.createQueryBuilder(SOLAR_ITEMS_ALIAS);
        qb = this.withCategory(qb);

        return qb;
    }

    private withCategory(qb: SelectQueryBuilder<SolarItemEntity>) {
        return qb
            .innerJoin(`${SOLAR_ITEMS_ALIAS}.category`, 'category')
            .addSelect(pick('category', CATEGORY_FIELDS));
    }
}
