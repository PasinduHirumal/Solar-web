import { Test, TestingModule } from '@nestjs/testing';
import { QuotationItemsService } from './quotation-items.service';

describe('QuotationItemsService', () => {
  let service: QuotationItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotationItemsService],
    }).compile();

    service = module.get<QuotationItemsService>(QuotationItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
