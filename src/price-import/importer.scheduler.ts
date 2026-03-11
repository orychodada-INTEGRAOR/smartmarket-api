// src/price-import/importer.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SmartImporterService } from './smart-importer.service';

@Injectable()
export class ImporterScheduler {
  constructor(private readonly importer: SmartImporterService) {}

  @Cron('0 */3 * * *')
  async run() {
    console.log('⏰ Running SmartMarket full import for all networks...');
    await this.importer.runFullImport();
  }
}