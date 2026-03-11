import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BasketQueryService } from './basket-query.service';
import { BasketCacheService } from './basket-cache.service';
import { PriceCacheService } from '../pricing/price-cache.service';

@Injectable()
export class BasketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly basketQuery: BasketQueryService,
    private readonly basketCache: BasketCacheService,
    private readonly priceCache: PriceCacheService,
  ) {}

  async calculateBasket(listId: string, storeIds: string[]) {
    console.time('basket');

    // 1) Cache לסל
    const cached = await this.basketCache.get(listId, storeIds);
    if (cached) {
      console.timeEnd('basket');
      return { cached: true, results: cached };
    }

    // 2) כל המוצרים ברשימה
    const productIds = await this.basketQuery.getProductIdsFromList(listId);
    if (productIds.length === 0) {
      console.timeEnd('basket');
      return { cached: false, results: [] };
    }

    // 3) כל המחירים בבת אחת (N+1 FIX)
    const prices = await this.prisma.storePriceSnapshot.findMany({
      where: {
        productId: { in: productIds },
        storeId: { in: storeIds },
      },
      select: {
        storeId: true,
        productId: true,
        price: true,
      },
    });

    // 4) PriceMap מהיר
    const priceMap = new Map<string, number>();
    for (const p of prices) {
      priceMap.set(`${p.storeId}-${p.productId}`, p.price);
    }

    // 5) חישוב סל לכל רשת — כאן שמים את ה‑typed array
    const results: {
      storeId: string;
      total: number;
      missingProducts: number;
    }[] = [];

    for (const storeId of storeIds) {
      let total = 0;
      let missing = 0;

      for (const productId of productIds) {
        const key = `${storeId}-${productId}`;
        const price = priceMap.get(key);

        if (price !== undefined) {
          total += price;
        } else {
          missing++;
        }
      }

      results.push({
        storeId,
        total,
        missingProducts: missing,
      });
    }

    // 6) שמירה ב־Cache
    await this.basketCache.set(listId, storeIds, results);

    console.timeEnd('basket');
    return { cached: false, results };
  }
}