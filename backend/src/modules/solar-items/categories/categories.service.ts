import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemCategoryEntity } from './entities/item-category.entity';
import { EntityManager, Not, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindCategoriesQueryDto } from './dto/find-categories-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DEFAULT_SOLAR_ITEM_CATEGORY_VALUES } from './constants/item-category.constants';

const CATEGORY_ALIAS = 'category';

const EXACT_FILTER_MAP: Partial<Record<keyof FindCategoriesQueryDto, string>> = {
    is_active:      `${CATEGORY_ALIAS}.is_active`,
};

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);
    
    constructor(
        @InjectRepository(ItemCategoryEntity)
        private readonly categoryRepo: Repository<ItemCategoryEntity>,
    ) {}

    async onModuleInit() {
        await this.ensureDefaultExists();
    }


    // methods
    async create(dto: CreateCategoryDto): Promise<ItemCategoryEntity> {
        const exists = await this.categoryRepo.existsBy({ title: dto.title });
        if (exists) throw new ConflictException(`${dto.title} category already exists`);

        return await this.categoryRepo.manager.transaction(async (manager: EntityManager) => {
            const category = manager.create(ItemCategoryEntity, dto);
            return await manager.save(ItemCategoryEntity, category);
        });
    }

    async findById(category_id: string): Promise<ItemCategoryEntity> {
        const category = await this.categoryRepo.findOne({
            where: { id: category_id }
        });

        if (!category) throw new NotFoundException(`Category not found`);

        return category;
    }

    async findAll(query: FindCategoriesQueryDto): Promise<PaginatedResponse<ItemCategoryEntity>> {
        const { page = 1, limit = 10, search_term, sort_by = 'created_at', sort_order = 'DESC' } = query;
        const skip = (page - 1) * limit;

        const idQueryBuilder = this.categoryRepo
            .createQueryBuilder(CATEGORY_ALIAS)
            .select(`${CATEGORY_ALIAS}.id`)
            .addSelect(`${CATEGORY_ALIAS}.${sort_by}`)
            .distinct(true);


        if (search_term) {
            const escaped = search_term.replace(/[\\%_]/g, '\\$&');

            idQueryBuilder.andWhere(
                `(${CATEGORY_ALIAS}.name    LIKE :search)`, { search: `%${escaped}%` }
            );
        }

        for (const [key, column] of Object.entries(EXACT_FILTER_MAP)) {
            const value = query[key as keyof FindCategoriesQueryDto];
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
                .orderBy(`${CATEGORY_ALIAS}.${sort_by}`, sort_order)
                .addOrderBy(`${CATEGORY_ALIAS}.id`, 'DESC')
                .skip(skip)
                .take(limit)
                .getMany()
        ).map((j) => j.id);

        if (ids.length === 0) return { items: [], meta };

        const items = await this.categoryRepo
            .createQueryBuilder(CATEGORY_ALIAS)
            .where(`${CATEGORY_ALIAS}.id IN (:...ids)`, { ids })
            .orderBy(`${CATEGORY_ALIAS}.${sort_by}`, sort_order)
            .addOrderBy(`${CATEGORY_ALIAS}.id`, 'DESC')
            .getMany();

        return { items, meta };
    }

    async updateData(category: ItemCategoryEntity, dto: UpdateCategoryDto): Promise<ItemCategoryEntity> {
        if (dto.title) {
            const exists = await this.categoryRepo.existsBy({ title: dto.title, id: Not(category.id) });
            if (exists) throw new ConflictException(`${dto.title} category already exists`);
        }

        return await this.categoryRepo.manager.transaction(async (manager: EntityManager) => {
            await manager.update(ItemCategoryEntity, category.id, dto);
                
            return await manager.findOneOrFail(ItemCategoryEntity, {
                where: { id: category.id },
            });
        });
    }

    async toggleStatus(category: ItemCategoryEntity): Promise<ItemCategoryEntity> {
        await this.categoryRepo
            .createQueryBuilder()
            .update(ItemCategoryEntity)
            .set({ is_active: () => 'NOT is_active' })
            .where('id = :id', { id: category.id })
            .execute();

        return this.findById(category.id);
    }

    async remove(category: ItemCategoryEntity): Promise<void> {
        try {
            await this.categoryRepo
                .createQueryBuilder()
                .delete()
                .from(ItemCategoryEntity)
                .where('id = :id', { id: category.id })
                .execute();
        } catch (error) {
            throw new BadRequestException(`Cannot delete category "${category.title}" — it is still assigned to one or more records`);
        }
    }


    // helpers
    private async ensureDefaultExists(): Promise<void> {
        const count = await this.categoryRepo.count();

        if (count === 0) {
            const created = this.categoryRepo.create(DEFAULT_SOLAR_ITEM_CATEGORY_VALUES);
            await this.categoryRepo.save(created);
            this.logger.log(`Seeded ${DEFAULT_SOLAR_ITEM_CATEGORY_VALUES.length} default category rows`);
        }
    }
}
