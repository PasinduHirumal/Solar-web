import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseFilePipeBuilder, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { SolarItemExistsPipe } from './pipes/solar-item-exists.pipe';
import { UpdateSolarItemDto } from './dto/update-solar-item.dto';
import { UpdatePriceDto } from '../../../common/dto/inventory/update-price.dto';

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

    @Put(':item_id/toggle/status')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async toggleSolarItemStatus(
        @Param('item_id', new ParseUUIDPipe({ version: '4'}), SolarItemExistsPipe) item: SolarItemEntity,
    ): Promise<SolarItemEntity> {
        return this.itemsService.toggleStatus(item);
    }

    @Put(':item_id/update/data')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateSolarItemData(
        @Param('item_id', new ParseUUIDPipe({ version: '4'}), SolarItemExistsPipe) item: SolarItemEntity,
        @Body() dto: UpdateSolarItemDto,
    ): Promise<SolarItemEntity> {
        return this.itemsService.updateData(item, dto);
    }

    @Put(':item_id/update/price')
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateSolarItemPrice(
        @Param('item_id', new ParseUUIDPipe({ version: '4'}), SolarItemExistsPipe) item: SolarItemEntity,
        @Body() dto: UpdatePriceDto,
    ): Promise<SolarItemEntity> {
        return this.itemsService.updatePrice(item, dto);
    }

    @Put(':item_id/update/picture')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('picture'))
    async updateSolarItemPicture(
        @Param('item_id', new ParseUUIDPipe({ version: '4'}), SolarItemExistsPipe) item: SolarItemEntity,
        @UploadedFile(
            new ParseFilePipeBuilder()
            .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE.IMAGE })
            .addValidator(new CustomFileTypeValidator([...IMAGE_MIME_TYPES]))
            .build({ fileIsRequired: true })
        ) picture: Express.Multer.File,
    ): Promise<SolarItemEntity> {
        return this.itemsService.updatePicture(item, picture);
    }

    @Get(':item_id')
    async getSolarItemById(
        @Param('item_id', new ParseUUIDPipe({ version: '4' })) item_id: string,
    ): Promise<SolarItemEntity> {
        return this.itemsService.findById(item_id);
    }

    @Delete(':item_id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteSolarItem(
        @Param('item_id', new ParseUUIDPipe({ version: '4'}), SolarItemExistsPipe) item: SolarItemEntity,
    ): Promise<void> {
        await this.itemsService.remove(item);
    }
}
