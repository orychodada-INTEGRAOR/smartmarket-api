import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PricingModule } from '../pricing/pricing.module';

import { BasketService } from './basket.service';
import { BasketQueryService } from './basket-query.service';
import { BasketCacheService } from './basket-cache.service';
import { BasketCalculatorService } from './basket-calculator.service';
import { BasketController } from './basket.controller';

@Module({
  imports: [
    PrismaModule,
    PricingModule, // כדי להשתמש ב‑PriceAggregationEngineService
  ],
  providers: [
    BasketService,
    BasketQueryService,
    BasketCacheService,
    BasketCalculatorService, // ← הוספנו אותו כאן
  ],
  controllers: [BasketController],
  exports: [
    BasketService,
    BasketCalculatorService, // ← וגם כאן אם מודולים אחרים צריכים אותו
  ],
})
export class BasketModule {}