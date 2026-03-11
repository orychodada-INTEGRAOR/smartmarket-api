import { Test, TestingModule } from '@nestjs/testing';
import { PriceReportsService } from './price-reports.service';

describe('PriceReportsService', () => {
  let service: PriceReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceReportsService],
    }).compile();

    service = module.get<PriceReportsService>(PriceReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
