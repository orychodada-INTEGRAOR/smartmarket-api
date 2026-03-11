import { Inject, Injectable } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class SearchService {
  constructor(
    @Inject('MEILISEARCH_CLIENT')
    private readonly client: MeiliSearch,
  ) {}

  async createIndex() {
    return this.client.index('products').updateSettings({
      searchableAttributes: ['title', 'brand', 'category'],
      filterableAttributes: ['brand', 'category'],
    });
  }

  async addDocuments(products: any[]) {
    return this.client.index('products').addDocuments(products);
  }

  async search(query: string) {
    return this.client.index('products').search(query);
  }
  async syncProducts(products: any[]) {
  const index = this.client.index('products');
  return index.addDocuments(products);
}
  async createProductsIndex() {
  return this.client.createIndex('products');
}
}