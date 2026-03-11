import { Controller, Get, Query, Post } from '@nestjs/common';
import { ProductNormalizationService } from './product-normalization.service';

@Controller('normalization')
export class NormalizationController {
  constructor(
    private readonly normalizationService: ProductNormalizationService,
  ) {}

  // נרמול כל המוצרים הקיימים
  @Post('normalize-all')
  async normalizeAll() {
    return this.normalizationService.normalizeAllProducts();
  }

  // חיפוש במוצרים מנורמלים
  @Get('search')
  async search(@Query('q') q: string) {
    if (!q) {
      return [];
    }
    return this.normalizationService.searchNormalized(q);
  }
}