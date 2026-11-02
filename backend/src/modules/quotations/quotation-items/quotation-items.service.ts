import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuotationItemEntity } from './entities/quotation-item.entity';
import { EntityManager, Repository } from 'typeorm';
import { QuotationEntity, QuotationStatus } from '../entities/quotation.entity';
import { CreateQuotationItemDto } from './dto/create-quotation-item.dto';
import { UpdateQuotationItemData } from './dto/update-quotation-item.dto';

const QUOTATION_ALIAS = 'quotation';

@Injectable()
export class QuotationItemsService {
    constructor(
        @InjectRepository(QuotationItemEntity)
        private readonly quotationItemRepo: Repository<QuotationItemEntity>,
    ) {}

    async addNew(quotation: QuotationEntity, dto: CreateQuotationItemDto): Promise<QuotationItemEntity> {
        if (quotation.status !== QuotationStatus.DRAFT && quotation.status !== QuotationStatus.SENT) {
            throw new BadRequestException(`Cannot add new item when ${quotation.status}`);
        }

        if (quotation.items.length + 1 > 25) {
            throw new BadRequestException(`Maximum 25 items can add for a Quotation`);
        }

        const exists = await this.quotationItemRepo.existsBy({ quotation_id: quotation.id, solar_item_id: dto.solar_item_id });
        if (exists) throw new ConflictException(`Item ${dto.solar_item_id} already exists`);

        return await this.quotationItemRepo.manager.transaction(async (manager: EntityManager) => {
            const locked = await manager
                .getRepository(QuotationEntity)
                .createQueryBuilder(QUOTATION_ALIAS)
                .setLock('pessimistic_write')
                .where(`${QUOTATION_ALIAS}.id = :id`, { id: quotation.id })
                .getOne();

            if (!locked) throw new NotFoundException(`Quotation with ID ${quotation.id} not found`);

            if (locked.status !== QuotationStatus.DRAFT && locked.status !== QuotationStatus.SENT) {
                throw new BadRequestException(`Cannot add new item when ${locked.status}`);
            }

            const quotationItem = manager.create(QuotationItemEntity, { ...dto, quotation_id: locked.id });
            return await manager.save(QuotationItemEntity, quotationItem);
        });
    }

    async update(quotation: QuotationEntity, quotation_item_id: string, dto: UpdateQuotationItemData): Promise<QuotationItemEntity> {
        if (quotation.status !== QuotationStatus.DRAFT && quotation.status !== QuotationStatus.SENT) {
            throw new BadRequestException(`Cannot update item when ${quotation.status}`);
        }

        const quotationItem = await this.findById(quotation.id, quotation_item_id);

        return await this.quotationItemRepo.manager.transaction(async (manager: EntityManager) => {
            await manager.update(QuotationItemEntity, quotationItem.id, dto);
            return await manager.findOneOrFail(QuotationItemEntity, { where: { id: quotationItem.id } });
        });
    }

    async remove(quotation: QuotationEntity, quotation_item_id: string): Promise<void> {
        if (quotation.status !== QuotationStatus.DRAFT && quotation.status !== QuotationStatus.SENT) {
            throw new BadRequestException(`Cannot delete item when ${quotation.status}`);
        }

        const quotationItem = await this.findById(quotation.id, quotation_item_id);
        try {
            await this.quotationItemRepo
                .createQueryBuilder()
                .delete()
                .from(QuotationItemEntity)
                .where('id = :id', { id: quotationItem.id })
                .execute();
        } catch (error) {
            throw new BadRequestException(`Cannot delete Quotation-Item — it is still assigned to one or more records`);
        }
    }


    // helpers
    private async findById(quotation_id: string, quotation_item_id: string) {
        const quotationItem = await this.quotationItemRepo.findOne({
            where: {
                id: quotation_item_id,
                quotation_id: quotation_id,
            },
        });

        if (!quotationItem) throw new NotFoundException(`Quotation-Item not found`);

        return quotationItem;
    }
}
