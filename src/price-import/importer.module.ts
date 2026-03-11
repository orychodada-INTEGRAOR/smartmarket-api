import { Module } from '@nestjs/common';

import { PricingModule } from '../pricing/pricing.module';
import { PrismaService } from '../prisma/prisma.service';

import { FileDiscoveryService } from './file-discovery.service';
import { DownloaderService } from './downloader.service';
import { XmlParserService } from './xml-parser.service';
import { XmlStreamParserService } from './xml-stream-parser.service';

import { BulkImportWithHistoryService } from './bulk-import-with-history.service';
import { ProductsImporter } from './importer.products';
import { StoresImporter } from './importer.stores';
import { PromoImporter } from './importer.promo';

import { SmartImporterService } from './smart-importer.service';

@Module({
  imports: [PricingModule],
  providers: [
    PrismaService,

    FileDiscoveryService,
    DownloaderService,
    XmlParserService,
    XmlStreamParserService,

    BulkImportWithHistoryService,
    ProductsImporter,
    StoresImporter,
    PromoImporter,

    SmartImporterService,
  ],
  exports: [
    SmartImporterService,
    XmlStreamParserService,
  ],
})
export class ImporterModule {}