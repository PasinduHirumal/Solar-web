import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { Roles } from '../identity/auth/decorators/roles.decorator';
import { UserRole } from '../identity/enums/user.enum';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/auth/guards/roles.guard';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { QuotationEntity } from './entities/quotation.entity';

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
}
