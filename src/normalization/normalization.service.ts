import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenizerService } from './tokenizer.service';
import { BrandExtractorService } from './brand-extractor.service';
import { SizeExtractorService } from './size-extractor.service';
import { CategoryClassifierService } from './category-classifier.service';
import { NormalizationCacheService } from './normalization-cache.service';

@Injectable()
export class NormalizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenizer: TokenizerService,
    private readonly brandExtractor: BrandExtractorService,
    private readonly sizeExtractor: SizeExtractorService,
    private readonly categoryClassifier: CategoryClassifierService,
    private readonly cache: NormalizationCacheService,
  ) {}

  private buildSearchTokens(
    name: string,
    tokens: string[],
    brand?: string | null,
    category?: string | null,
  ) {
    const base = [name, brand, category].filter(Boolean).join(' ');
    return (base + ' ' + tokens.join(' ')).toLowerCase().trim();
  }

  /**
   * Normalize a single product by id
   */
  async normalizeProductById(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) return null;

    return this.normalizeProductEntity(product);
  }

  /**
   * Core normalization logic for a product entity
   */
  async normalizeProductEntity(product: { id: string; name: string }) {
    const rawName = product.name;

    // 1) Tokenize
    const tokens = this.tokenizer.tokenize(rawName);

    // 2) Brand
    const brand =
      this.brandExtractor.extractBrandFromTokens(tokens) ??
      this.brandExtractor.extractBrandFromName(rawName);

    // 3) Size
    const size = this.sizeExtractor.extractSize(rawName);

    // 4) Category
    const category =
      this.categoryClassifier.extractCategoryFromTokens(tokens) ??
      this.categoryClassifier.extractCategoryFromName(rawName);

    // 5) Normalized name (basic cleaning)
    const normalizedName = rawName
      .toLowerCase()
      .replace(/"/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 6) Search tokens
    const searchTokens = this.buildSearchTokens(
      normalizedName,
      tokens,
      brand,
      category,
    );

    // 7) Upsert normalizedProduct
    const normalized = await this.prisma.normalizedProduct.upsert({
      where: { name: normalizedName },
      update: {
        brand: brand ?? undefined,
        size: size?.value,
        unit: size?.unit,
        category: category ?? undefined,
        searchTokens,
      },
      create: {
        name: normalizedName,
        brand: brand ?? undefined,
        size: size?.value,
        unit: size?.unit,
        category: category ?? undefined,
        searchTokens,
      },
    });

    // 8) Link Product → NormalizedProduct
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        normalizedProductId: normalized.id,
      },
    });

    // 9) Cache
    await this.cache.set(normalized.id, normalized);

    return normalized;
  }

  /**
   * Normalize all products in DB (batch)
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
        batch.map((p) => this.normalizeProductEntity(p)),
      );

      normalizedBatch.forEach((normalized, index) => {
        if (!normalized) return;
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
}