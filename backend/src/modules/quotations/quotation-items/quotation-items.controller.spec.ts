import { Test, TestingModule } from '@nestjs/testing';
import { QuotationItemsController } from './quotation-items.controller';

describe('QuotationItemsController', () => {
  let controller: QuotationItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotationItemsController],
    }).compile();

    controller = module.get<QuotationItemsController>(QuotationItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
