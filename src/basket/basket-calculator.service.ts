import { Injectable } from '@nestjs/common';
import { PriceAggregationEngineService } from '../pricing/price-aggregation-engine.service';
import { BasketQueryService } from './basket-query.service';

@Injectable()
export class BasketCalculatorService {
  constructor(
    private readonly engine: PriceAggregationEngineService,
    private readonly query: BasketQueryService,
  ) {}

  /**
   * NEW — calculate basket from a shopping list
   */
  async calculateBasketFromList(listId: string) {
    const productIds = await this.query.getProductIdsFromList(listId);
    return this.engine.findCheapestBasket(productIds);
  }

  /**
   * EXISTING — calculate basket for a specific store
   */
  async calculateBasketForStore(storeId: string, productIds: string[]) {
    return this.engine.findCheapestBasket(productIds);
  }

  /**
   * EXISTING — split basket across stores
   */
  async calculateSplitBasket(productIds: string[]) {
    return this.engine.findSplitBasket(productIds);
  }
}