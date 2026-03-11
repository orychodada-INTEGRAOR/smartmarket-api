import { Controller, Get, Query, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async search(@Query('q') q: string) {
    return this.searchService.search(q);
  }

  @Post('create-index')
  async createIndex() {
    return this.searchService.createProductsIndex();
  }

  @Post('sync')
  async sync() {
    const products = await this.prisma.normalizedProduct.findMany();
    return this.searchService.syncProducts(products);
  }
}