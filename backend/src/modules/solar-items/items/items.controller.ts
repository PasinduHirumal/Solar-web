import { Body, Controller, Get, Param, ParseFilePipeBuilder, ParseUUIDPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Roles } from '../../identity/auth/decorators/roles.decorator';
import { UserRole } from '../../identity/enums/user.enum';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSolarItemDto } from './dto/create-solar-item.dto';
import { MAX_FILE_SIZE } from '../../../common/constants/file-size.constant';
import { CustomFileTypeValidator } from '../../../common/validators/custom-file-type.validator';
import { IMAGE_MIME_TYPES } from '../../../common/constants/file-types.constant';
import { SolarItemEntity } from './entities/solar-items.entity';
import { FindSolarItemsQueryDto } from './dto/find-solar-items-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Controller('items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService,
    ) {}

    @Get()
    async getAllSolarItems(
        @Query() query: FindSolarItemsQueryDto,
    ): Promise<PaginatedResponse<SolarItemEntity>> {
        return this.itemsService.findAll(query);
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('picture'))
    async createSolarItem(
        @Body() dto: CreateSolarItemDto,
        @UploadedFile(
            new ParseFilePipeBuilder()
            .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE.IMAGE })
            .addValidator(new CustomFileTypeValidator([...IMAGE_MIME_TYPES]))
            .build({ fileIsRequired: true })
        ) picture: Express.Multer.File,
    ): Promise<SolarItemEntity> {
        return this.itemsService.create(dto, picture);
    }

    @Get(':item_id')
    async getSolarItemById(
        @Param('item_id', new ParseUUIDPipe({ version: '4' })) item_id: string,
    ): Promise<SolarItemEntity> {
        return this.itemsService.findById(item_id);
    }
}
