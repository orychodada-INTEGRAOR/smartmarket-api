import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PriceAggregationEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async findCheapestBasket(productIds: string[]) {
    const prices = await this.prisma.price.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, storeId: true, price: true },
    });

    const storeTotals: Record<string, number> = {};

    for (const p of prices) {
      if (!storeTotals[p.storeId]) storeTotals[p.storeId] = 0;
      storeTotals[p.storeId] += p.price;
    }

    return Object.entries(storeTotals)
      .map(([storeId, total]) => ({ storeId, total }))
      .sort((a, b) => a.total - b.total)[0];
  }

  async findSplitBasket(productIds: string[]) {
    const prices = await this.prisma.price.findMany({
      where: { productId: { in: productIds } },
    });

    const best: Record<string, any> = {};

    for (const p of prices) {
      if (!best[p.productId] || p.price < best[p.productId].price) {
        best[p.productId] = p;
      }
    }

    const basket = Object.values(best);
    const total = basket.reduce((sum: number, p: any) => sum + p.price, 0);

    return { basket, total };
  }
}