// src/pricing/basket-engine.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BasketEngineService {
  constructor(private prisma: PrismaService) {}

  async findCheapestBasket(productIds: string[]) {
    const prices = await this.prisma.price.findMany({
      where: {
        productId: { in: productIds },
      },
      include: {
        store: true,
      },
    });

    const totals: Record<string, number> = {};

    for (const p of prices) {
      if (!totals[p.storeId]) {
        totals[p.storeId] = 0;
      }
      totals[p.storeId] += p.price;
    }

    return Object.entries(totals)
      .map(([storeId, total]) => ({ storeId, total }))
      .sort((a, b) => a.total - b.total)[0];
  }
}