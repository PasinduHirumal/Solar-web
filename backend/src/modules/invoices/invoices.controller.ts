import { Body, Controller, Get, Param, ParseFilePipeBuilder, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { InvoiceExistsPipe } from './pipes/invoice-exists.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_FILE_SIZE } from '../../common/constants/file-size.constant';
import { CustomFileTypeValidator } from '../../common/validators/custom-file-type.validator';
import { DOCUMENT_MIME_TYPES } from '../../common/constants/file-types.constant';

@Controller('invoices')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
    constructor(
        private readonly invoiceService: InvoicesService,
    ) {}

    @Get()
    async getAllInvoices(
        @Query() query: FindInvoicesQueryDto,
    ): Promise<PaginatedResponse<InvoiceEntity>> {
        return this.invoiceService.findAllInvoices(query);
    }

    @Post(':invoice_id/send/email')
    @UseInterceptors(FileInterceptor('pdf'))
    async sendInvoiceToCustomer(
        @Param('invoice_id', new ParseUUIDPipe({ version: '4'}), InvoiceExistsPipe) invoice: InvoiceEntity,
        @UploadedFile(
            new ParseFilePipeBuilder()
            .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE.DOCUMENT })
            .addValidator(new CustomFileTypeValidator([...DOCUMENT_MIME_TYPES]))
            .build({ fileIsRequired: true })
        ) pdf: Express.Multer.File,
    ): Promise<void> {
        return this.invoiceService.sendToCustomer(invoice, pdf);
    }

    @Post(':quotation_id')
    async createInvoice(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
        @Body() dto: CreateInvoiceDto,
    ): Promise<InvoiceEntity> {
        return this.invoiceService.generate(quotation, dto);
    }

    @Put(':invoice_id/:quotation_id')
    async updateToLatestPrices(
        @Param('invoice_id', new ParseUUIDPipe({ version: '4'}), InvoiceExistsPipe) invoice: InvoiceEntity,
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
    ): Promise<void> {
        return this.invoiceService.updateToLatestPrices(quotation, invoice);
    }

    @Get(':invoice_id')
    async getInvoiceWithPriceBreakdown(
        @Param('invoice_id', new ParseUUIDPipe({ version: '4'})) invoice_id: string,
    ): Promise<InvoiceEntity> {
        return this.invoiceService.findById(invoice_id, true);
    }
}
