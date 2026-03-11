// src/price-import/bulk-import.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BulkImportService {
  constructor(private prisma: PrismaService) {}

  async importPrices(items: any[]) {
    const data = items.map((item) => ({
      productId: String(item.ItemCode),
      storeId: String(item.StoreId),
      price: Number(item.ItemPrice),
    }));

    await this.prisma.price.createMany({
      data,
      skipDuplicates: true,
    });
  }
}