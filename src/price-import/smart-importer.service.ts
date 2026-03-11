import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { NETWORKS } from './networks.config';
import { FileDiscoveryService } from './file-discovery.service';
import { DownloaderService } from './downloader.service';
import { XmlParserService } from './xml-parser.service';

import { BulkImportWithHistoryService } from './bulk-import-with-history.service';
import { ProductsImporter } from './importer.products';
import { StoresImporter } from './importer.stores';
import { PromoImporter } from './importer.promo';

import { PrismaService } from '../prisma/prisma.service';
import { PriceAggregationEngineService } from '../pricing/price-aggregation-engine.service';

@Injectable()
export class SmartImporterService {
  constructor(
    private readonly discovery: FileDiscoveryService,
    private readonly downloader: DownloaderService,
    private readonly parser: XmlParserService,

    private readonly bulkImportWithHistory: BulkImportWithHistoryService,
    private readonly productsImporter: ProductsImporter,
    private readonly storesImporter: StoresImporter,
    private readonly promoImporter: PromoImporter,

    private readonly prisma: PrismaService,
    private readonly aggregation: PriceAggregationEngineService,
  ) {}

  private ensureDataDir() {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async runFullImport() {
    this.ensureDataDir();

    for (const network of NETWORKS) {
      console.log(`\n=== Importing network: ${network.name} (${network.companyId}) ===`);
      await this.importForNetwork(network.name, network.companyId, network.baseUrl);
    }

    console.log('\n=== Rebuilding snapshots & aggregated prices ===');
    // אם תרצה — נבנה לך מנוע rebuildAll אמיתי
    // כרגע רק placeholder
    // await this.aggregation.rebuildAll();
  }

  private async importForNetwork(name: string, companyId: string, baseUrl: string) {
    await this.importFileType(name, companyId, baseUrl, 'ProductsFull');
    await this.importFileType(name, companyId, baseUrl, 'StoresFull');
    await this.importFileType(name, companyId, baseUrl, 'PriceFull');
    await this.importFileType(name, companyId, baseUrl, 'PromoFull');
  }

  private async importFileType(
    networkName: string,
    companyId: string,
    baseUrl: string,
    fileType: 'PriceFull' | 'ProductsFull' | 'StoresFull' | 'PromoFull',
  ) {
    const startedAt = new Date();
    console.log(`Importing ${fileType} for ${networkName}...`);

    try {
      const fileUrl = await this.discovery.findLatestFile(baseUrl, fileType);

      const tmpPath = path.join(
        process.cwd(),
        'data',
        `${networkName}-${fileType}-${Date.now()}.gz`,
      );

      const downloaded = await this.downloader.downloadFile(fileUrl, tmpPath);
      const extracted = await this.downloader.extractIfNeeded(downloaded);

      if (!fs.existsSync(extracted)) {
        throw new Error('Extracted file not found');
      }

      const xmlBuffer = fs.readFileSync(extracted);
      const parsed = await this.parser.parse(xmlBuffer);

      const root = parsed?.Root || parsed?.root || parsed;
      const items = root?.Items?.Item || root?.items?.item || [];

      if (!Array.isArray(items)) {
        console.log(`No items found for ${fileType} (${networkName})`);
      } else {
        switch (fileType) {
          case 'ProductsFull':
            await this.productsImporter.importProducts(items);
            break;

          case 'StoresFull':
            await this.storesImporter.importStores(items, companyId, networkName);
            break;

          case 'PriceFull':
            await this.bulkImportWithHistory.importPrices(items);
            break;

          case 'PromoFull':
            await this.promoImporter.importPromotions(items);
            break;
        }
      }

      await this.prisma.importLog.create({
        data: {
          companyId,
          fileName: fileUrl,
          fileType,
          success: true,
          recordsCount: Array.isArray(items) ? items.length : 0,
          startedAt,
          finishedAt: new Date(),
        },
      });

      console.log(`✅ ${fileType} for ${networkName} imported successfully.`);
    } catch (err: any) {
      console.error(`❌ Failed to import ${fileType} for ${networkName}:`, err?.message);

      await this.prisma.importLog.create({
        data: {
          companyId,
          fileName: baseUrl,
          fileType,
          success: false,
          message: err?.message || 'Unknown error',
          startedAt,
          finishedAt: new Date(),
        },
      });
    }
  }
}