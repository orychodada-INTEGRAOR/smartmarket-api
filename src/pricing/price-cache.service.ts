import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PriceCacheService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CACHE_MANAGER') private readonly cache: Cache,
  ) {}

  private storePriceKey(productId: string, storeId: string) {
    return `price:store:${storeId}:product:${productId}`;
  }

  private aggregatedPriceKey(productId: string) {
    return `price:aggregated:${productId}`;
  }

  async getStorePrice(productId: string, storeId: string) {
    const key = this.storePriceKey(productId, storeId);
    const cached = await this.cache.get<number>(key);

    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const row = await this.prisma.storePriceSnapshot.findUnique({
      where: { productId_storeId: { productId, storeId } },
      select: { price: true },
    });

    if (!row) return null;

    await this.cache.set(key, row.price, 60);
    return row.price;
  }

  async getAggregatedPrice(productId: string) {
    const key = this.aggregatedPriceKey(productId);
    const cached = await this.cache.get<any>(key);

    if (cached) {
      return cached;
    }

    const row = await this.prisma.aggregatedPrice.findUnique({
      where: { productId },
    });

    if (!row) return null;

    await this.cache.set(key, row, 60);
    return row;
  }
}