import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Roles } from '../identity/auth/decorators/roles.decorator';
import { UserRole } from '../identity/enums/user.enum';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/auth/guards/roles.guard';
import { QuotationExistsPipe } from '../quotations/pipes/quotation-exists.pipe';
import { QuotationEntity } from '../quotations/entities/quotation.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceEntity } from './entities/invoice.entity';
import { FindInvoicesQueryDto } from './dto/find-invoice-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly invoiceService: InvoicesService,
    ) {}

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getAllInvoices(
        @Query() query: FindInvoicesQueryDto,
    ): Promise<PaginatedResponse<InvoiceEntity>> {
        return this.invoiceService.findAll(query);
    }

    @Post(':quotation_id')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createQuotation(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
        @Body() dto: CreateInvoiceDto,
    ): Promise<InvoiceEntity> {
        return this.invoiceService.generate(quotation, dto);
    }

    @Get(':quotation_id/:invoice_id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getInvoiceWithPriceBreakdown(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
        @Param('invoice_id', new ParseUUIDPipe({ version: '4'})) invoice_id: string,
    ): Promise<InvoiceEntity> {
        return this.invoiceService.findWithPriceBreakdown(quotation, invoice_id);
    }
}
