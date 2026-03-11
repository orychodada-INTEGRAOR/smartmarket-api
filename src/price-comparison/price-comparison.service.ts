import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface BasketItemInput {
  barcode?: string;
  productId?: string;
  qty: number;
}

export interface StoreBasketPrice { 
  storeId: string;
  storeName: string;
  totalPrice: number;
  missingProducts: number;
}

@Injectable()
export class PriceComparisonService {
  constructor(private prisma: PrismaService) {}

  async normalizeBasket(items: BasketItemInput[]) {
    const normalized: { productId: string; qty: number }[] = [];

    for (const item of items) {
      if (item.productId) {
        normalized.push({ productId: item.productId, qty: item.qty });
        continue;
      }

      if (item.barcode) {
        const product = await this.prisma.product.findFirst({
          where: { barcode: item.barcode },
          select: { id: true },
        });
        if (product) {
          normalized.push({ productId: product.id, qty: item.qty });
        }
      }
    }

    return normalized;
  }

  async calculateBasketForAllStores(
    items: BasketItemInput[],
    options?: { maxDistanceKm?: number; userLocationId?: number },
  ): Promise<StoreBasketPrice[]> {
    const normalized = await this.normalizeBasket(items);

    if (!normalized.length) return [];

    const stores = await this.prisma.store.findMany({
      // בהמשך נוסיף סינון לפי מיקום / מרחק
    });

    const results: StoreBasketPrice[] = [];

    for (const store of stores) {
      let totalPrice = 0;
           let missingProducts = 0;

      for (const item of normalized) {
        const price = await this.prisma.price.findUnique({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: store.id,
            },
          },
        });

        if (!price) {
          missingProducts++;
          continue;
        }

        const base = price.price * item.qty;
        totalPrice += base;

              }

      results.push({
        storeId: store.id,
        storeName: store.name,
        totalPrice,
       
        missingProducts,
      });
    }

    // בהמשך נוסיף: מבצעים, דירוג, מרחק
    results.sort((a, b) => a.totalPrice - b.totalPrice);

    return results;
  }
}