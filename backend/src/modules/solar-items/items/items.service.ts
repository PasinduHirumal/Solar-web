import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SolarItemEntity } from './entities/solar-items.entity';
import { EntityManager, Repository } from 'typeorm';
import { FilesService } from '../../files/files.service';
import { CreateSolarItemDto } from './dto/create-solar-item.dto';
import { randomUUID } from 'crypto';
import { FileEntity } from '../../files/entities/file.entity';
import { CategoriesService } from '../categories/categories.service';
import { FILE_LOG_MESSAGES } from '../../files/constants/file-errors.constants';

const SOLAR_ITEMS_ALIAS = 'items';

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
}
