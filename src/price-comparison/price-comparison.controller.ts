// src/price-comparison/price-comparison.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PriceComparisonService } from './price-comparison.service';

export interface BasketItemInput {
  productId?: string;
  barcode?: string;
  qty: number;
}

@Controller('price-comparison')
export class PriceComparisonController {
  constructor(private readonly service: PriceComparisonService) {}

  @Post('basket')
  calculateBasket(@Body() body: { items: { productId: number; qty: number }[] }) {
    const items: BasketItemInput[] = body.items.map((i) => ({
      productId: String(i.productId),
      qty: i.qty,
    }));

    return this.service.calculateBasketForAllStores(items);
  }

  @Post('basket-by-barcode')
  calculateBasketByBarcode(
    @Body()
    body: {
      items: { barcode?: string; productId?: number; qty: number }[];
    },
  ) {
    const items: BasketItemInput[] = body.items.map((i) => ({
      barcode: i.barcode,
      productId: i.productId !== undefined ? String(i.productId) : undefined,
      qty: i.qty,
    }));

    return this.service.calculateBasketForAllStores(items);
  }
}