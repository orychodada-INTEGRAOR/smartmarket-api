import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShufersalCrawlerService {
  private readonly logger = new Logger(ShufersalCrawlerService.name);

  async getPriceIndex() {
    const url =
      'https://pricesprodpublic.blob.core.windows.net/price/PriceFullIndex.xml';

    this.logger.log('Fetching Shufersal index...');

    const res = await axios.get(url);

    return res.data;
  }
}