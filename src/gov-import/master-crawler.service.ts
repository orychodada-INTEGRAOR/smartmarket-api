import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GovImportService } from './gov-import.service';

@Injectable()
export class MasterCrawlerService {
  private readonly logger = new Logger(MasterCrawlerService.name);
  private readonly GOV_INDEX_URL = 'https://www.gov.il/he/pages/cpfta_prices_regulations';
  
  // הוספנו הגדרות HTTP מלאות שמחקות דפדפן בצורה מוחלטת
  private readonly headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Connection': 'keep-alive',
    'Referer': 'https://www.google.com/',
    'Cookie': '_ga=GA1.1.2059111357.1771155808; _cls_v=fc0b0259-4834-48a5-b212-95c900d21da0; U_Gov_ID=bc18bff3-be94-41dc-9c19-3fe7472cb241; cf_clearance=PokgCgnIs_NlVw6JfbavIo8i9wqTBn6ldUd8yiySEyw-1773073015-1.2.1.1-lXHaTFBoywkmMne11uCrRcU_cViCRu0E7hsnyebuILZ460ywVtZI5I4khLpgQxS0dQ.dTC_zjCovPxyt1vOMFsgWRGZyeBetnutx9gcsuyG0viIrZi1HDw0v5dvbKQSl2msDWgzm7iYnIevKXJJBKkQeBA58vDBgIkKqfzIC0_fS5BKMhm1IqRiZuU8co4q54pNSYLmwhXwnnu6p3n5VzuF8hRWRdWYJ_H_rfA2ioYY; __cf_bm=sFVqICK2WrCr33JA2HBELrHEOts0vbsjHJtXHafp1bA-1773073015.6371455-1.0.1.1-hB06xjnBdA3QTQrevl5EeO1SQ4zRBYufb6HVTiyp9Pr3KzfCvL3glPA2SzLsK0A6OyZz1rXO83Udl33y9VW4KzeK1SZWxiRhSrTYmSI3l51vQ6ZBmdzK.BjsXKmiAyjE'
  };

  constructor(private readonly govImportService: GovImportService) {}

  async crawlAllChains() {
    this.logger.log('--- STARTING MASTER CRAWL (V2) ---');
    try {
      // נשתמש ב-axios עם timeout גבוה כדי לוודא שזה לא ניתוק טכני
      const response = await axios.get(this.GOV_INDEX_URL, { 
        headers: this.headers,
        timeout: 15000,
        validateStatus: (status) => status < 500 // נקבל גם 403 כדי לראות את התוכן במקרה של שגיאה
      });
      
      if (response.status === 403) {
        this.logger.error('CRITICAL: Access Denied (403) by Cloudflare.');
        return;
      }

      const $ = cheerio.load(response.data);
      const chainLinks: { name: string; url: string }[] = [];

      $('a').each((i, el) => {
        const url = $(el).attr('href');
        const name = $(el).text().trim();
        if (url && (url.includes('prices') || url.includes('catalog'))) {
          const fullUrl = url.startsWith('http') ? url : `https://www.gov.il${url}`;
          if (!chainLinks.find(c => c.url === fullUrl)) {
            chainLinks.push({ name: name || 'Chain', url: fullUrl });
          }
        }
      });

      this.logger.log(`Found ${chainLinks.length} chains. Processing...`);
      for (const chain of chainLinks) {
        this.logger.log(`>> Importing: ${chain.name}`);
        await this.govImportService.importFromIndex(chain.url).catch(e => this.logger.error(e.message));
      }
    } catch (error) {
      this.logger.error(`Master Crawl failed: ${error.message}`);
    }
  }
}