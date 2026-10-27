import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolarItemEntity } from './entities/solar-items.entity';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { FilesService } from '../../files/files.service';
import { CreateSolarItemDto } from './dto/create-solar-item.dto';
import { randomUUID } from 'crypto';
import { FileEntity } from '../../files/entities/file.entity';
import { CategoriesService } from '../categories/categories.service';
import { FILE_LOG_MESSAGES } from '../../files/constants/file-errors.constants';
import { FindSolarItemsQueryDto } from './dto/find-solar-items-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { pick } from '../../../utils/pick-fields.util';
import { FILE_FIELDS } from '../../files/constants/file-fields.constants';
import { CATEGORY_FIELDS } from '../categories/constants/item-category-fields.constants';

const SOLAR_ITEMS_ALIAS = 'solar_items';

const EXACT_FILTER_MAP: Partial<Record<keyof FindSolarItemsQueryDto, string>> = {
    is_active:              `${SOLAR_ITEMS_ALIAS}.is_active`,
    category_id:            `${SOLAR_ITEMS_ALIAS}.category_id`,
};

@Injectable()
export class ItemsService {
    private readonly logger = new Logger(ItemsService.name);

    constructor(
        @InjectRepository(SolarItemEntity)
        private readonly solarItemRepo: Repository<SolarItemEntity>,

        private readonly fileUploadService: FilesService,
        private readonly categoryService: CategoriesService,
    ) {}

    async create(dto: CreateSolarItemDto, picture: Express.Multer.File): Promise<SolarItemEntity> {
        const category = await this.categoryService.findById(dto.category_id);
        if (!category.is_active) throw new BadRequestException(`Category not in active`);

        const safariCode = await this.generateItemCode(dto.title);

        let uploadedFile: FileEntity | undefined;

        try {
            uploadedFile = await this.fileUploadService.uploadFile(picture, 'solar-item-image');
            
            return await this.solarItemRepo.manager.transaction(async (manager: EntityManager) => {
                const solarItem = manager.create(SolarItemEntity, {
                    ...dto,
                    code: safariCode,
                    category_id: category.id,
                    picture_id: uploadedFile!.id,
                    selling_price: dto.marked_price,
                });

                return await manager.save(SolarItemEntity, solarItem);
            });
        } catch (error) {
            if (uploadedFile) {
                try {
                    await this.fileUploadService.deleteFile(uploadedFile.id);
                } catch (rollbackError) {
                    this.logger.error(
                        FILE_LOG_MESSAGES.UPLOAD_ROLLBACK_FAILED(uploadedFile.id),
                        rollbackError instanceof Error ? rollbackError.stack : rollbackError,
                    );
                }
            }

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
        qb = this.withPicture(qb);

        return qb;
    }

    private detailQueryBuilder() {
        let qb = this.solarItemRepo.createQueryBuilder(SOLAR_ITEMS_ALIAS);
        qb = this.withCategory(qb);
        qb = this.withPicture(qb);

        return qb;
    }

    private withPicture(qb: SelectQueryBuilder<SolarItemEntity>) {
        return qb
            .innerJoin(`${SOLAR_ITEMS_ALIAS}.picture`, 'picture')
            .addSelect(pick('picture', FILE_FIELDS));
    }

    private withCategory(qb: SelectQueryBuilder<SolarItemEntity>) {
        return qb
            .innerJoin(`${SOLAR_ITEMS_ALIAS}.category`, 'category')
            .addSelect(pick('category', CATEGORY_FIELDS));
    }
}
