import { Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class BasketCacheService {
  constructor(
    @Inject('CACHE_MANAGER') private cache: Cache,
  ) {}

  getCacheKey(listId: string, storeIds: string[]) {
    const storesHash = storeIds.sort().join(',');
    return `basket:${listId}:${storesHash}`;
  }

  async get(listId: string, storeIds: string[]) {
    const key = this.getCacheKey(listId, storeIds);
    return this.cache.get(key);
  }

  async set(listId: string, storeIds: string[], value: any) {
    const key = this.getCacheKey(listId, storeIds);
    await this.cache.set(key, value, 60); // TTL 60 seconds
  }
}