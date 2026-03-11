import { Controller, Post, Body } from '@nestjs/common';
import { BasketCalculatorService } from './basket-calculator.service';

@Controller('basket')
export class BasketController {
  constructor(private readonly calc: BasketCalculatorService) {}

  /**
   * NEW — calculate basket from a shopping list
   */
  @Post('from-list')
  async basketFromList(@Body() body: { listId: string }) {
    return this.calc.calculateBasketFromList(body.listId);
  }

  /**
   * EXISTING — calculate basket for a specific store
   */
  @Post('store')
  async basketForStore(@Body() body: { storeId: string; productIds: string[] }) {
    return this.calc.calculateBasketForStore(body.storeId, body.productIds);
  }

  /**
   * EXISTING — split basket across stores
   */
  @Post('split')
  async splitBasket(@Body() body: { productIds: string[] }) {
    return this.calc.calculateSplitBasket(body.productIds);
  }
}