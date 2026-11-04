import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from '../identity/auth/decorators/roles.decorator';
import { UserRole } from '../identity/enums/user.enum';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/auth/guards/roles.guard';
import { FindPaymentsQueryDto } from './dto/find-payment-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { PaymentEntity } from './entities/payment.entity';
import { InvoiceExistsPipe } from '../invoices/pipes/invoice-exists.pipe';
import { InvoiceEntity } from '../invoices/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from '../identity/auth/decorators/current-user.decorator';
import { UserEntity } from '../identity/entities/user.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentExistsPipe } from './pipes/payment-exists.pipe';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentService: PaymentsService,
    ) {}

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getAllPaymentsForInvoice(
        @Query() query: FindPaymentsQueryDto,
    ): Promise<PaginatedResponse<PaymentEntity>> {
        return this.paymentService.findAllPayments(query);
    }

    @Post(':invoice_id/add/payment')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async addPaymentToInvoice(
        @Param('invoice_id', new ParseUUIDPipe({ version: '4'}), InvoiceExistsPipe) invoice: InvoiceEntity,
        @Body() dto: CreatePaymentDto,
        @CurrentUser() authorized_admin: UserEntity,
    ): Promise<PaymentEntity> {
        return this.paymentService.payToInvoice(invoice, dto, authorized_admin);
    }

    @Put(':invoice_id/:payment_id/revoke')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async revokePayment(
        @Param('invoice_id', new ParseUUIDPipe({ version: '4'}), InvoiceExistsPipe) invoice: InvoiceEntity,
        @Param('payment_id', new ParseUUIDPipe({ version: '4'}), PaymentExistsPipe) payment: PaymentEntity,
        @Body() dto: UpdatePaymentDto,
        @CurrentUser() revoked_admin: UserEntity,
    ): Promise<PaymentEntity> {
        return this.paymentService.revokePayment(payment, invoice, dto, revoked_admin);
    }

    @Get(':payment_id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getPaymentById(
        @Param('payment_id', new ParseUUIDPipe({ version: '4'})) payment_id: string,
    ): Promise<PaymentEntity> {
        return this.paymentService.findById(payment_id);
    }
}
