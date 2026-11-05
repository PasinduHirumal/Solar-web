import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { Roles } from '../../identity/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { UserRole } from '../../identity/enums/user.enum';
import { RolesGuard } from '../../identity/auth/guards/roles.guard';
import { QuotationItemsService } from './quotation-items.service';
import { QuotationExistsPipe } from '../pipes/quotation-exists.pipe';
import { QuotationEntity } from '../entities/quotation.entity';
import { CreateQuotationItemDto } from './dto/create-quotation-item.dto';
import { QuotationItemEntity } from './entities/quotation-item.entity';
import { UpdateQuotationItemData } from './dto/update-quotation-item.dto';

@Controller('quotation-items')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationItemsController {
    constructor(
        private readonly quotationItemsService: QuotationItemsService,
    ) {}

    @Post(':quotation_id')
    async addNewQuotationItem(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
        @Body() dto: CreateQuotationItemDto,
    ): Promise<QuotationItemEntity> {
        return this.quotationItemsService.addNew(quotation, dto);
    }

    @Put(':quotation_id/:quotation_item_id')
    async updateQuotationItem(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
        @Param('quotation_item_id', new ParseUUIDPipe({ version: '4'})) quotation_item_id: string,
        @Body() dto: UpdateQuotationItemData,
    ): Promise<QuotationItemEntity> {
        return this.quotationItemsService.update(quotation, quotation_item_id, dto);
    }

    @Delete(':quotation_id/:quotation_item_id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteQuotationItem(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
        @Param('quotation_item_id', new ParseUUIDPipe({ version: '4'})) quotation_item_id: string,
    ): Promise<void> {
        await this.quotationItemsService.remove(quotation, quotation_item_id);
    }
}
