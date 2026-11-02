import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuotationItemEntity } from './entities/quotation-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuotationItemsService {
    constructor(
        @InjectRepository(QuotationItemEntity)
        private readonly quotationRepo: Repository<QuotationItemEntity>,
    ) {}
}
