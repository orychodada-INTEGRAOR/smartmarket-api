// src/price-import/importer.promo.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoImporter {
  constructor(private prisma: PrismaService) {}

  async importPromotions(items: any[]) {
    for (const item of items) {
      const promoId: string | undefined = item.PromotionId;
      const productId: string | undefined = item.ItemCode;
      const storeId: string | undefined = item.StoreId;

      if (!promoId || !productId || !storeId) continue;

      const title: string | undefined = item.PromotionDescription;
      const description: string | undefined = item.PromotionDescription;
      const price: number | null = item.PromotionPrice ? Number(item.PromotionPrice) : null;
      const minQty: number | null = item.MinQty ? Number(item.MinQty) : null;

      const startDate = item.StartDate ? new Date(item.StartDate) : new Date();
      const endDate = item.EndDate ? new Date(item.EndDate) : null;

      await this.prisma.promotion.upsert({
        where: { id: promoId },
        update: {
          productId,
          storeId,
          title: title || 'Promotion',
          description,
          price,
          minQty,
          validFrom: startDate,
          validTo: endDate,
        },
        create: {
          id: promoId,
          productId,
          storeId,
          title: title || 'Promotion',
          description,
          price,
          minQty,
          validFrom: startDate,
          validTo: endDate,
        },
      });
    }
  }
}