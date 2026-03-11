// src/price-import/importer.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsImporter } from './importer.products';
import { PromoImporter } from './importer.promo';
import { StoresImporter } from './importer.stores';

@Injectable()
export class ImporterService {
  constructor(
    private prisma: PrismaService,
    private productsImporter: ProductsImporter,
    private promoImporter: PromoImporter,
    private storesImporter: StoresImporter,
  ) {}

  async runImport() {
    // כאן בהמשך תכניס את הלוגיקה:
    // 1. גילוי קבצים
    // 2. הורדה
    // 3. parse XML
    // 4. קריאה ל-importers
    console.log('ImporterService.runImport() – not implemented yet');
  }
}