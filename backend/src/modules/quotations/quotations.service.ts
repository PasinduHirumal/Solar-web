import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { QuotationEntity, QuotationStatus } from './entities/quotation.entity';
import { randomUUID } from 'crypto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { AuthHelperService } from '../identity/auth/helpers/auth-helper.service';
import { UserRole } from '../identity/enums/user.enum';
import { QuotationItemEntity } from './quotation-items/entities/quotation-item.entity';

@Injectable()
export class QuotationsService {
    constructor(
        @InjectRepository(QuotationEntity)
        private readonly quotationRepo: Repository<QuotationEntity>,

        private readonly authService: AuthHelperService,
    ) {}

    async create(dto: CreateQuotationDto): Promise<QuotationEntity> {
        if (!dto.phone || !dto.address) {
            throw new BadRequestException(`Customer Phone-Number & Address are required`);
        }

        let customer = await this.authService.findEntityByEmail(dto.email);

        if (!customer) {
            customer = await this.authService.createUserBySystem(
                {
                    email: dto.email,
                    name: dto.name,
                    role: UserRole.USER,
                    phone: dto.phone,
                    address: dto.address,
                },
                {
                    googleId: null,
                    isAnonymous: true,
                    mustChangePassword: true,
                }
            );
        }

        const quotationNumber = await this.generateQuotationNumber(customer.name);

        const { email, name, phone, address, item_ids, ...restDto } = dto;

        return await this.quotationRepo.manager.transaction(async (manager: EntityManager) => {
            const quotation = manager.create(QuotationEntity, {
                ...restDto,
                quotation_number: quotationNumber,
                status: QuotationStatus.DRAFT,
                items: item_ids.map((i) => manager.create(QuotationItemEntity, { solar_item_id: i.solar_item_id, quantity: i.quantity })),
            });

            return await manager.save(QuotationEntity, quotation);
        });
    }


    // helpers
    private async generateQuotationNumber(customer_name: string): Promise<string> {
        const orgPrefix = `SO-QU`;
        const customerPrefix = customer_name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');

        for (let attempt = 0; attempt < 5; attempt++) {
            const suffix = randomUUID().split('-')[0].toUpperCase();
            const code = `${orgPrefix}-${customerPrefix}-${suffix}`;

            const exists = await this.quotationRepo.existsBy({ quotation_number: code });
            if (!exists) return code;
        }

        throw new BadRequestException('Failed to generate a unique quotation number, please try again');
    }
}
