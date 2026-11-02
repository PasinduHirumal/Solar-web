import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Roles } from '../identity/auth/decorators/roles.decorator';
import { UserRole } from '../identity/enums/user.enum';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/auth/guards/roles.guard';
import { QuotationExistsPipe } from '../quotations/pipes/quotation-exists.pipe';
import { QuotationEntity } from '../quotations/entities/quotation.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceEntity } from './entities/invoice.entity';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly invoiceService: InvoicesService,
    ) {}

    @Post(':quotation_id')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createQuotation(
        @Param('quotation_id', new ParseUUIDPipe({ version: '4'}), QuotationExistsPipe) quotation: QuotationEntity,
        @Body() dto: CreateInvoiceDto,
    ): Promise<InvoiceEntity> {
        return this.invoiceService.generate(quotation, dto);
    }
}
