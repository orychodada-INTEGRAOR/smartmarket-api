import { Injectable, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NormalizationCacheService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CACHE_MANAGER') private readonly cache: Cache,
  ) {}

  private key(id: string) {
    return `normalized:product:${id}`;
  }

  async get(id: string) {
    const cached = await this.cache.get(this.key(id));
    if (cached) return cached;

    const product = await this.prisma.normalizedProduct.findUnique({
      where: { id },
    });

    if (product) {
      await this.cache.set(this.key(id), product, 60 * 60 * 24); // 24h
    }

    return product;
  }

  async set(id: string, data: any) {
    await this.cache.set(this.key(id), data, 60 * 60 * 24);
  }

  async invalidate(id: string) {
    await this.cache.del(this.key(id));
  }
}