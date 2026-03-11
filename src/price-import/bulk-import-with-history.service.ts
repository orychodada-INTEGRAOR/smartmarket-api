import { Injectable } from '@nestjs/common';
import { PriceHistoryService } from '../pricing/price-history.service';

@Injectable()
export class BulkImportWithHistoryService {
  constructor(private readonly priceHistory: PriceHistoryService) {}

  async importPrices(items: any[]) {
    for (const item of items) {
      const productId = String(item.ItemCode);
      const storeId = String(item.StoreId);
      const price = Number(item.ItemPrice);

      if (!productId || !storeId || isNaN(price)) continue;

     await this.priceHistory.updatePrice(productId, storeId, price);
    }
  }
}