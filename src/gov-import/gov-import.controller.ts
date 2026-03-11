import { Controller, Get, Post, Body } from '@nestjs/common';
import { GovImportService } from './gov-import.service';
import { MasterCrawlerService } from './master-crawler.service';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('gov-import')
export class GovImportController {
  constructor(
    private readonly govImport: GovImportService,
    private readonly masterCrawler: MasterCrawlerService,
  ) {}

  @Get('ping')
  ping() {
    return { status: 'ok', from: 'gov-import' };
  }

  // סריקה מלאה של כל האתרים שמופיעים בדף הממשלתי
  @Post('crawl-all')
  async crawlAll() {
    this.masterCrawler.crawlAllChains(); // רץ ברקע כדי לא לחסום את ה-API
    return {
      status: 'ok',
      message: 'Master crawl started. Check logs for progress.',
    };
  }

  @Post('run')
  async runImport(@Body('url') url: string) {
    if (!url) return { status: 'error', message: 'Missing URL' };
    await this.govImport.importPriceFile(url);
    return { status: 'ok', importedUrl: url };
  }

  @Post('run-from-index')
  async runFromIndex(@Body('indexUrl') indexUrl: string) {
    if (!indexUrl) return { status: 'error', message: 'Missing indexUrl' };
    await this.govImport.importFromIndex(indexUrl);
    return { status: 'ok', indexUrl };
  }
}