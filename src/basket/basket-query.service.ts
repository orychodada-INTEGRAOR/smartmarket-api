import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BasketQueryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all productIds from a shopping list
   */
  async getProductIdsFromList(listId: string): Promise<string[]> {
    const items = await this.prisma.listItem.findMany({
      where: { listId },
      select: {
        normalizedProductId: true,
      },
    });

    return items.map((item) => item.normalizedProductId);
  }

  /**
   * Get all prices for a product across all stores
   */
  async getProductPrices(productId: string) {
    return this.prisma.storePriceSnapshot.findMany({
      where: { productId },
      select: {
        storeId: true,
        price: true,
      },
    });
  }

  /**
   * Get the cheapest price for a product (aggregated)
   */
  async getCheapestPrice(productId: string) {
    return this.prisma.aggregatedPrice.findUnique({
      where: { productId },
    });
  }

  /**
   * Get basket prices for a specific store
   * (Used before N+1 optimization)
   */
  async getBasketForStore(storeId: string, productIds: string[]) {
    return this.prisma.storePriceSnapshot.findMany({
      where: {
        storeId,
        productId: { in: productIds },
      },
      select: {
        productId: true,
        price: true,
      },
    });
  }
}