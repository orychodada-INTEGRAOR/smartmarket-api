import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ProductMatchingService } from '../product-matching/product-matching.service';
import { FileIndexService } from './file-index.service';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import * as zlib from 'zlib';

@Injectable()
export class GovImportService {
  private readonly logger = new Logger(GovImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly matcher: ProductMatchingService,
    private readonly fileIndex: FileIndexService,
  ) {}

  @Cron('0 * * * *')
  async scheduledImport() {
    this.logger.log('Running scheduled gov import...');
  }

  async importFromIndex(indexUrl: string) {
    const fileUrl = await this.fileIndex.getLatestPriceFileUrl(indexUrl);

    this.logger.log(`Importing file: ${fileUrl}`);

    await this.importPriceFile(fileUrl);
  }

  async importPriceFile(url: string) {
    const buffer = await this.download(url);

    const xml =
      url.endsWith('.gz')
        ? zlib.gunzipSync(buffer).toString('utf8')
        : buffer.toString('utf8');

    await this.parsePriceFull(xml);
  }

  private async download(url: string): Promise<Buffer> {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
    });

    return Buffer.from(res.data);
  }

  private async parsePriceFull(xmlString: string) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });

    const xml = parser.parse(xmlString);

    const chainId = xml.Root?.ChainId;
    const storeId = xml.Root?.StoreId;

    const items = xml.Root?.Items?.Item ?? [];

    this.logger.log(`Items detected: ${items.length}`);

    const batchSize = 500;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      await Promise.all(
        batch.map((item) =>
          this.processPriceItem(
            {
              barcode: item.ItemCode,
              name: item.ItemName || item.ItemNm,
              manufacturer: item.ManufacturerName,
              unitQty: item.UnitQty,
              unitOfMeasure: item.UnitOfMeasure,
              quantity: item.Quantity,
              price: parseFloat(item.ItemPrice),
            },
            { chainId, storeId },
          ),
        ),
      );
    }

    this.logger.log('Import finished');
  }

  private async processPriceItem(item: any, header: any) {
    const normalized = await this.matcher.matchOrCreate(item);

    const product = await this.prisma.product.upsert({
      where: { id: item.barcode },
      update: {
        name: item.name,
        manufacturer: item.manufacturer,
      },
      create: {
        id: item.barcode,
        barcode: item.barcode,
        name: item.name,
        manufacturer: item.manufacturer,
        normalizedProductId: normalized.id,
      },
    });

    await this.prisma.price.upsert({
      where: {
        productId_storeId: {
          productId: product.id,
          storeId: header.storeId,
        },
      },
      update: {
        price: item.price,
      },
      create: {
        productId: product.id,
        storeId: header.storeId,
        price: item.price,
      },
    });
  }
}