import { Test, TestingModule } from '@nestjs/testing';
import { PriceReportsController } from './price-reports.controller';

describe('PriceReportsController', () => {
  let controller: PriceReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceReportsController],
    }).compile();

    controller = module.get<PriceReportsController>(PriceReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
