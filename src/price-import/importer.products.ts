// src/price-import/importer.products.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsImporter {
  constructor(private prisma: PrismaService) {}

  async importProducts(items: any[]) {
    for (const item of items) {
      const productId: string | undefined = item.ItemCode;
      if (!productId) continue;

      const barcode: string | undefined = item.ItemBarcode;
      const name: string | undefined = item.ItemName;
      const manufacturer: string | undefined = item.ManufacturerName;
      const unitQty: string | undefined = item.Quantity;
      const unitOfMeasure: string | undefined = item.UnitOfMeasure;
      const category: string | undefined = item.Category;

      await this.prisma.product.upsert({
        where: { id: productId },
        update: {
          barcode,
          name: name || 'Unknown',
          manufacturer,
          unitQty,
          unitOfMeasure,
          category,
        },
        create: {
          id: productId,
          barcode,
          name: name || 'Unknown',
          manufacturer,
          unitQty,
          unitOfMeasure,
          category,
        },
      });
    }
  }
}