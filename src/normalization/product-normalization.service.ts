import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NormalizationCacheService } from './normalization-cache.service';

@Injectable()
export class ProductNormalizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: NormalizationCacheService,
  ) {}

  /**
   * Get normalized product (with Redis cache)
   */
  async getNormalizedProduct(id: string) {
    return this.cache.get(id);
  }

  /**
   * Normalize a single product
   */
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/"/g, '')
      .replace(/ליטר/g, 'l')
      .replace(/מ"ל/g, 'ml')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractSize(name: string) {
    const match = name.match(/(\d+(\.\d+)?)\s?(ml|l|g|kg|גרם|ק"ג)/i);
    if (!match) return null;

    return {
      value: parseFloat(match[1]),
      unit: match[3].toLowerCase(),
    };
  }

  private extractBrand(name: string) {
    const brands = [
      'coca cola',
      'pepsi',
      'nestle',
      'strauss',
      'tara',
      'elite',
      'תנובה',
      'קוקה קולה',
      'טרה',
      'עלית',
    ];

    const lower = name.toLowerCase();

    for (const brand of brands) {
      if (lower.includes(brand)) {
        return brand;
      }
    }

    return null;
  }

  private buildSearchTokens(
    name: string,
    brand?: string | null,
    category?: string | null,
  ) {
    return [name, brand, category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  async normalizeSingleProduct(product: { id: string; name: string }) {
    const normalizedName = this.normalizeName(product.name);
    const size = this.extractSize(normalizedName);
    const brand = this.extractBrand(normalizedName);

    const normalized = await this.prisma.normalizedProduct.upsert({
      where: { name: normalizedName },
      update: {},
      create: {
        name: normalizedName,
        brand: brand ?? undefined,
        size: size?.value,
        unit: size?.unit,
        searchTokens: this.buildSearchTokens(normalizedName, brand, null),
      },
    });

    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        normalizedProductId: normalized.id,
      },
    });

    return normalized;
  }

  /**
   * Normalize all products in DB
   */
  async normalizeAllProducts() {
    const products = await this.prisma.product.findMany({
      select: { id: true, name: true },
    });

    const results: { productId: string; normalizedId: string }[] = [];
    const batchSize = 500;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const normalizedBatch = await Promise.all(
        batch.map((p) => this.normalizeSingleProduct(p)),
      );

      normalizedBatch.forEach((normalized, index) => {
        const original = batch[index];
        results.push({
          productId: original.id,
          normalizedId: normalized.id,
        });
      });
    }

    return {
      count: results.length,
      mapped: results,
    };
  }

  /**
   * Search normalized products
   */
  async searchNormalized(query: string) {
    const q = query.toLowerCase().trim();

    if (!q) return [];

    return this.prisma.normalizedProduct.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { brand: { contains: q } },
          { category: { contains: q } },
          { searchTokens: { contains: q } },
        ],
      },
      take: 50,
    });
  }
}