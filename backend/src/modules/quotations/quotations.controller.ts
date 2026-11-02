import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { Roles } from '../identity/auth/decorators/roles.decorator';
import { UserRole } from '../identity/enums/user.enum';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/auth/guards/roles.guard';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { QuotationEntity } from './entities/quotation.entity';
import { FindQuotationsQueryDto } from './dto/find-quotation-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { QuotationResponse } from './interfaces/quotation-response.interface';
import { UpdateQuotationDiscountDto } from './dto/update-quotation-discount.dto';
import { UpdateQuotationTaxDto } from './dto/update-quotation-tax.dto';
import { QuotationExistsPipe } from './pipes/quotation-exists.pipe';
import { UpdateQuotationDataDto } from './dto/update-quotation-data.dto';

@Controller('quotations')
export class QuotationsController {
    constructor(
        private readonly quotationService: QuotationsService,
    ) {}

    @Post()
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createQuotation(
        @Body() dto: CreateQuotationDto,
    ): Promise<QuotationEntity> {
        return this.quotationService.create(dto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getAllQuotations(
        @Query() query: FindQuotationsQueryDto,
    ): Promise<PaginatedResponse<QuotationEntity>> {
        return this.quotationService.findAll(query);
    }

    @Put(':quotation_id/status/accept')
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateQuotationStatusAccept(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'})) quotation_id: string,
    ): Promise<QuotationEntity> {
        return this.quotationService.acceptQuotation(quotation_id);
    }

    @Put(':quotation_id/status/reject')
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateQuotationStatusReject(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'})) quotation_id: string,
    ): Promise<QuotationEntity> {
        return this.quotationService.rejectQuotation(quotation_id);
    }

    @Put(':quotation_id/data')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateQuotationData(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'})) quotation_id: string,
        @Body() dto: UpdateQuotationDataDto,
    ): Promise<QuotationEntity> {
        return this.quotationService.updateData(quotation_id, dto);
    }

    @Put(':quotation_id/discount')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateQuotationDiscount(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'})) quotation_id: string,
        @Body() dto: UpdateQuotationDiscountDto,
    ): Promise<QuotationEntity> {
        return this.quotationService.updateDiscount(quotation_id, dto);
    }

    @Put(':quotation_id/tax')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateQuotationTax(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'})) quotation_id: string,
        @Body() dto: UpdateQuotationTaxDto,
    ): Promise<QuotationEntity> {
        return this.quotationService.updateTax(quotation_id, dto);
    }

    @Get(':quotation_id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getQuotationWithPriceBreakdown(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
    ): Promise<QuotationResponse> {
        return this.quotationService.findWithPriceBreakdown(quotation);
    }

    @Delete(':quotation_id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteQuotation(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
    ): Promise<void> {
        return this.quotationService.remove(quotation);
    }
}
