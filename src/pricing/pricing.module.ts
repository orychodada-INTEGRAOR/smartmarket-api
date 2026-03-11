import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { PriceCacheService } from './price-cache.service';
import { PriceHistoryService } from './price-history.service';
import { PriceAggregationEngineService } from './price-aggregation-engine.service';

@Module({
  imports: [PrismaModule],
  providers: [
    PriceCacheService,
    PriceHistoryService,
    PriceAggregationEngineService,
  ],
  exports: [
    PriceCacheService,
    PriceHistoryService,
    PriceAggregationEngineService,
  ],
})
export class PricingModule {}