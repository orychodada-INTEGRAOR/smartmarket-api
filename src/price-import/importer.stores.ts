// src/price-import/importer.stores.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoresImporter {
  constructor(private prisma: PrismaService) {}

  async importStores(items: any[], chainId: string, chainName: string) {
    // קודם נוודא שה־Chain קיים
    await this.prisma.chain.upsert({
      where: { id: chainId },
      update: {
        name: chainName,
      },
      create: {
        id: chainId,
        name: chainName,
      },
    });

    for (const item of items) {
      const storeId: string | undefined = item.StoreId;
      if (!storeId) continue;

      const name: string | undefined = item.StoreName;
      const city: string | undefined = item.City;
      const address: string | undefined = item.Address;

      await this.prisma.store.upsert({
        where: { id: storeId },
        update: {
          name: name || 'Unknown',
          city,
          address,
          chainId,
        },
        create: {
          id: storeId,
          name: name || 'Unknown',
          city,
          address,
          chainId,
        },
      });
    }
  }
}