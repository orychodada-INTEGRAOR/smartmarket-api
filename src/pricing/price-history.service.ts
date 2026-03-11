import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PriceHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async updatePrice(productId: string, storeId: string, newPrice: number) {
    const existing = await this.prisma.price.findFirst({
      where: { productId, storeId },
    });

    if (!existing) {
      const price = await this.prisma.price.create({
        data: { productId, storeId, price: newPrice },
      });

      await this.prisma.priceHistory.create({
        data: {
          priceId: price.id,
          productId,
          storeId,
          price: newPrice,
        },
      });

      return;
    }

    if (existing.price === newPrice) return;

    await this.prisma.priceHistory.updateMany({
      where: { priceId: existing.id, validTo: null },
      data: { validTo: new Date() },
    });

    await this.prisma.price.update({
      where: { id: existing.id },
      data: { price: newPrice },
    });

    await this.prisma.priceHistory.create({
      data: {
        priceId: existing.id,
        productId,
        storeId,
        price: newPrice,
      },
    });
  }
}