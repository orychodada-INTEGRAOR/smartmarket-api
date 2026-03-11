import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GovImportService } from './gov-import.service';
import { GovImportController } from './gov-import.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ProductMatchingModule } from '../product-matching/product-matching.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FileIndexService } from './file-index.service';
import { MasterCrawlerService } from './master-crawler.service';

@Module({
  imports: [
    HttpModule, // הוספנו תמיכה בשיחות HTTP
    ProductMatchingModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [GovImportController],
  providers: [
    GovImportService,
    PrismaService,
    FileIndexService,
    MasterCrawlerService, // הוספנו את הזחלן החדש
  ],
  exports: [MasterCrawlerService]
})
export class GovImportModule {}