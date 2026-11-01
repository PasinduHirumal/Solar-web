import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
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

    @Put(':quotation_id/discount')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateQuotationDiscount(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'})) quotation_id: string,
        @Body() dto: UpdateQuotationDiscountDto,
    ): Promise<void> {
        return this.quotationService.updateDiscount(quotation_id, dto);
    }

    @Put(':quotation_id/tax')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateQuotationTax(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'})) quotation_id: string,
        @Body() dto: UpdateQuotationTaxDto,
    ): Promise<void> {
        return this.quotationService.updateTax(quotation_id, dto);
    }

    @Get(':quotation_id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getQuotationById(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'})) quotation_id: string,
    ): Promise<QuotationResponse> {
        return this.quotationService.findById(quotation_id);
    }
}
