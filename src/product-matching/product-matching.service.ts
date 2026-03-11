import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SimilarityService } from './similarity.service';

@Injectable()
export class ProductMatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly similarity: SimilarityService,
  ) {}

  normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/[^a-z0-9א-ת ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractBrand(name: string): string | null {
    return null; // placeholder
  }

  /**
   * Load products for a store using Price table
   */
  private async loadStoreProducts(storeId: string) {
    const prices = await this.prisma.price.findMany({
      where: { storeId },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            normalizedProduct: {
              select: {
                id: true,
                name: true,
                brand: true,
                size: true,
                unit: true,
                category: true,
                searchTokens: true,
              },
            },
          },
        },
      },
    });

    return prices
      .filter((p) => p.product.normalizedProduct)
      .map((p) => ({
        productId: p.product.id,
        ...p.product.normalizedProduct,
      }));
  }

  async matchStores(storeA: string, storeB: string) {
    const productsA = await this.loadStoreProducts(storeA);
    const productsB = await this.loadStoreProducts(storeB);

    const matches: {
      productA: any;
      productB: any;
      score: number;
    }[] = [];

    for (const a of productsA) {
      let bestMatch: any = null;
      let bestScore = 0;

      for (const b of productsB) {
        const score = this.similarity.computeSimilarity(a, b);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = b;
        }
      }

      if (bestMatch && bestScore >= 0.65) {
        matches.push({
          productA: a,
          productB: bestMatch,
          score: bestScore,
        });
      }
    }

    return matches;
  }
async matchOrCreate(item: any) {
  const normalizedName = this.normalizeName(item.name);

  let normalized = await this.prisma.normalizedProduct.findFirst({
    where: {
      name: normalizedName,
    },
  });

  if (!normalized) {
    normalized = await this.prisma.normalizedProduct.create({
      data: {
        name: normalizedName,
        brand: item.manufacturer || null,
      },
    });
  }

  return normalized;
}
  isSameProduct(a: any, b: any) {
    const score = this.similarity.computeSimilarity(a, b);
    return score >= 0.85;
  }
}