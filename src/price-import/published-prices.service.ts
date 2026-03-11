import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as zlib from 'zlib';
import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublishedPricesService {
  private BASE_URL = 'https://url.publishedprices.co.il';
  private DATA_DIR = path.join(process.cwd(), 'data', 'import');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.DATA_DIR)) {
      fs.mkdirSync(this.DATA_DIR, { recursive: true });
    }
  }

  // ----------------------------------------------------
  // 1) משיכת רשימת קבצים מהמאגר (Auto-Discovery)
  // ----------------------------------------------------
  async fetchFileList(): Promise<string[]> {
    const response = await axios.get(`${this.BASE_URL}/file`);
    const html = response.data as string;

    const matches = html.match(/(PriceFull|ProductsFull|StoresFull|PromoFull)\d+-.*?\.gz/g);
    return matches || [];
  }

  // ----------------------------------------------------
  // 2) קיבוץ לפי companyId
  // ----------------------------------------------------
  groupByCompany(files: string[]) {
    const grouped: Record<string, string[]> = {};

    for (const file of files) {
      const match = file.match(/(PriceFull|ProductsFull|StoresFull|PromoFull)(\d+)/);
      if (!match) continue;

      const companyId = match[2];

      if (!grouped[companyId]) grouped[companyId] = [];
      grouped[companyId].push(file);
    }

    return grouped;
  }

  // ----------------------------------------------------
  // 3) חילוץ timestamp אמיתי מהשם
  // ----------------------------------------------------
  extractTimestampFromFileName(fileName: string): Date | null {
    const match = fileName.match(/(\d{8}-\d{6})/);
    if (!match) return null;

    const ts = match[1];
    return new Date(
      `${ts.substring(0, 4)}-${ts.substring(4, 6)}-${ts.substring(6, 8)}T${ts.substring(9, 11)}:${ts.substring(11, 13)}:${ts.substring(13, 15)}`
    );
  }

  // ----------------------------------------------------
  // 4) Delta Import — בדיקה אם קובץ כבר יובא (ImportLog)
  // ----------------------------------------------------
  async hasFileBeenImported(companyId: string, fileName: string, fileType: string): Promise<boolean> {
    const exists = await this.prisma.importLog.findFirst({
      where: { companyId, fileName, fileType, success: true },
    });

    return !!exists;
  }

  // ----------------------------------------------------
  // 5) סימון קובץ כמיובא (ImportLog)
  // ----------------------------------------------------
  async markFileAsImported(
    companyId: string,
    fileName: string,
    fileType: string,
    success: boolean,
    message?: string
  ) {
    await this.prisma.importLog.create({
      data: {
        companyId,
        fileName,
        fileType,
        success,
        message: message || null,
      },
    });
  }

  // ----------------------------------------------------
  // 6) הורדה + gunzip + XML → JSON
  // ----------------------------------------------------
  async downloadAndExtract(fileName: string) {
    const url = `${this.BASE_URL}/file/${fileName}`;
    const gzPath = path.join(this.DATA_DIR, fileName);
    const xmlPath = gzPath.replace('.gz', '');

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(gzPath, response.data);

    const xmlBuffer = zlib.gunzipSync(fs.readFileSync(gzPath));
    fs.writeFileSync(xmlPath, xmlBuffer);

    const xmlString = xmlBuffer.toString('utf-8');
    return xml2js.parseStringPromise(xmlString);
  }

  // ----------------------------------------------------
  // 7) PriceHistory Engine
  // ----------------------------------------------------
  private async updatePriceHistory(priceRecordId: string, productId: string, storeId: string, newPrice: number) {
    const last = await this.prisma.priceHistory.findFirst({
      where: { productId, storeId, validTo: null },
      orderBy: { validFrom: 'desc' },
    });

    const now = new Date();

    if (!last) {
      await this.prisma.priceHistory.create({
        data: {
          priceId: priceRecordId,
          productId,
          storeId,
          price: newPrice,
          validFrom: now,
        },
      });
      return;
    }

    if (last.price === newPrice) return;

    await this.prisma.priceHistory.update({
      where: { id: last.id },
      data: { validTo: now },
    });

    await this.prisma.priceHistory.create({
      data: {
        priceId: priceRecordId,
        productId,
        storeId,
        price: newPrice,
        validFrom: now,
      },
    });
  }

  // ----------------------------------------------------
  // 8) PriceFull Importer
  // ----------------------------------------------------
  async importPrices(companyId: string, fileName: string) {
    const parsed = await this.downloadAndExtract(fileName);
    const items = parsed?.Root?.Items?.[0]?.Item || [];

    for (const item of items) {
      const productId = item.ItemCode?.[0];
      const storeId = item.StoreId?.[0];
      const price = parseFloat(item.ItemPrice?.[0] || '0');

      if (!productId || !storeId) continue;

      const priceRecord = await this.prisma.price.upsert({
        where: {
          productId_storeId: { productId, storeId },
        },
        update: {
          price,
          validFrom: new Date(),
          validTo: null,
        },
        create: {
          id: `${productId}_${storeId}`,
          productId,
          storeId,
          price,
        },
      });

      await this.updatePriceHistory(priceRecord.id, productId, storeId, price);
    }

    console.log(`Imported PriceFull for company ${companyId}`);
  }

  // ----------------------------------------------------
  // 9) ProductsFull — XML Parser
  // ----------------------------------------------------
  private parseProductsXml(parsed: any) {
    const items = parsed?.Root?.Items?.[0]?.Item || [];
    const products: any[] = [];

    for (const item of items) {
      products.push({
        id: item.ItemCode?.[0] || null,
        barcode: item.ItemBarcode?.[0] || null,
        name: item.ItemName?.[0] || null,
        manufacturer: item.ManufacturerName?.[0] || null,
        unitQty: item.Quantity?.[0] || null,
        unitOfMeasure: item.UnitOfMeasure?.[0] || null,
        category: item.Category?.[0] || null,
      });
    }

    return products;
  }

  // ----------------------------------------------------
  // 10) ProductsFull Importer
  // ----------------------------------------------------
  async importProducts(companyId: string, fileName: string) {
    const parsed = await this.downloadAndExtract(fileName);
    const products = this.parseProductsXml(parsed);

    for (const p of products) {
      if (!p.id) continue;

      await this.prisma.product.upsert({
        where: { id: p.id },
        update: {
          barcode: p.barcode,
          name: p.name || 'Unknown',
          manufacturer: p.manufacturer,
          unitQty: p.unitQty,
          unitOfMeasure: p.unitOfMeasure,
          category: p.category,
        },
        create: {
          id: p.id,
          barcode: p.barcode,
          name: p.name || 'Unknown',
          manufacturer: p.manufacturer,
          unitQty: p.unitQty,
          unitOfMeasure: p.unitOfMeasure,
          category: p.category,
        },
      });
    }

    console.log(`Imported ProductsFull for company ${companyId}`);
  }

  // ----------------------------------------------------
  // 11) StoresFull — XML Parser
  // ----------------------------------------------------
  private parseStoresXml(parsed: any) {
    const items = parsed?.Root?.Items?.[0]?.Item || [];
    const stores: any[] = [];

    for (const item of items) {
      stores.push({
        id: item.StoreId?.[0] || null,
        name: item.StoreName?.[0] || null,
        address: item.Address?.[0] || null,
        city: item.City?.[0] || null,
        chainId: item.ChainId?.[0] || null,
      });
    }

    return stores;
  }

  // ----------------------------------------------------
  // 12) StoresFull Importer
  // ----------------------------------------------------
  async importStores(companyId: string, fileName: string) {
    const parsed = await this.downloadAndExtract(fileName);
    const stores = this.parseStoresXml(parsed);

    for (const s of stores) {
      if (!s.id) continue;

      if (s.chainId) {
        await this.prisma.chain.upsert({
          where: { id: s.chainId },
          update: { name: s.chainId },
          create: { id: s.chainId, name: s.chainId },
        });
      }

      await this.prisma.store.upsert({
        where: { id: s.id },
        update: {
          name: s.name || 'Unknown',
          address: s.address,
          city: s.city,
          chainId: s.chainId || companyId,
        },
        create: {
          id: s.id,
          name: s.name || 'Unknown',
          address: s.address,
          city: s.city,
          chainId: s.chainId || companyId,
        },
      });
    }

    console.log(`Imported StoresFull for company ${companyId}`);
  }

  // ----------------------------------------------------
  // 13) PromoFull — XML Parser
  // ----------------------------------------------------
  private parsePromotionsXml(parsed: any) {
    const items = parsed?.Root?.Items?.[0]?.Item || [];
    const promos: any[] = [];

    for (const item of items) {
      promos.push({
        id: item.PromotionId?.[0] || null,
        productId: item.ItemCode?.[0] || null,
        storeId: item.StoreId?.[0] || null,
        title: item.PromotionDescription?.[0] || null,
        description: item.PromotionDescription?.[0] || null,
        startDate: item.StartDate?.[0] || null,
        endDate: item.EndDate?.[0] || null,
        minQty: item.MinQty?.[0] || null,
        price: item.PromotionPrice?.[0] || null,
      });
    }

    return promos;
  }

  // ----------------------------------------------------
  // 14) PromoFull Importer
  // ----------------------------------------------------
  async importPromotions(companyId: string, fileName: string) {
    const parsed = await this.downloadAndExtract(fileName);
    const promos = this.parsePromotionsXml(parsed);

    for (const p of promos) {
      if (!p.id || !p.productId || !p.storeId) continue;

      await this.prisma.promotion.upsert({
        where: { id: p.id },
        update: {
          productId: p.productId,
          storeId: p.storeId,
          title: p.title || 'Promotion',
          description: p.description,
          price: p.price ? Number(p.price) : null,
          minQty: p.minQty ? Number(p.minQty) : null,
          validFrom: p.startDate ? new Date(p.startDate) : new Date(),
          validTo: p.endDate ? new Date(p.endDate) : null,
        },
        create: {
          id: p.id,
          productId: p.productId,
          storeId: p.storeId,
          title: p.title || 'Promotion',
          description: p.description,
          price: p.price ? Number(p.price) : null,
          minQty: p.minQty ? Number(p.minQty) : null,
          validFrom: p.startDate ? new Date(p.startDate) : new Date(),
          validTo: p.endDate ? new Date(p.endDate) : null,
        },
      });
    }

    console.log(`Imported PromoFull for company ${companyId}`);
  }

  // ----------------------------------------------------
  // 15) בחירת קובץ אחרון לפי timestamp
  // ----------------------------------------------------
  getLatestFile(files: string[], type: string): string | null {
    const filtered = files.filter(f => f.includes(type));
    const mapped = filtered
      .map(f => {
        const ts = this.extractTimestampFromFileName(f);
        return ts ? { file: f, ts } : null;
      })
      .filter((x): x is { file: string; ts: Date } => x !== null)
      .sort((a, b) => b.ts.getTime() - a.ts.getTime());

    return mapped[0]?.file || null;
  }

  // ----------------------------------------------------
  // 16) runFullImport — PriceFull + ProductsFull + StoresFull + PromoFull
  // ----------------------------------------------------
  async runFullImport() {
    const files = await this.fetchFileList();
    const grouped = this.groupByCompany(files);

    for (const companyId of Object.keys(grouped)) {
      const companyFiles = grouped[companyId];

      try {
        // PriceFull
        const priceFile = this.getLatestFile(companyFiles, 'PriceFull');
        if (priceFile && !(await this.hasFileBeenImported(companyId, priceFile, 'PriceFull'))) {
          await this.importPrices(companyId, priceFile);
          await this.markFileAsImported(companyId, priceFile, 'PriceFull', true);
        }

        // ProductsFull
        const productsFile = this.getLatestFile(companyFiles, 'ProductsFull');
        if (productsFile && !(await this.hasFileBeenImported(companyId, productsFile, 'ProductsFull'))) {
          await this.importProducts(companyId, productsFile);
          await this.markFileAsImported(companyId, productsFile, 'ProductsFull', true);
        }

        // StoresFull
        const storesFile = this.getLatestFile(companyFiles, 'StoresFull');
        if (storesFile && !(await this.hasFileBeenImported(companyId, storesFile, 'StoresFull'))) {
          await this.importStores(companyId, storesFile);
          await this.markFileAsImported(companyId, storesFile, 'StoresFull', true);
        }

        // PromoFull
        const promoFile = this.getLatestFile(companyFiles, 'PromoFull');
        if (promoFile && !(await this.hasFileBeenImported(companyId, promoFile, 'PromoFull'))) {
          await this.importPromotions(companyId, promoFile);
          await this.markFileAsImported(companyId, promoFile, 'PromoFull', true);
        }
      } catch (err: any) {
        console.error(`Error importing company ${companyId}:`, err?.message || err);

        await this.markFileAsImported(
          companyId,
          'UNKNOWN',
          'ERROR',
          false,
          err?.message || 'Unknown error during import'
        );
      }
    }
  }
}