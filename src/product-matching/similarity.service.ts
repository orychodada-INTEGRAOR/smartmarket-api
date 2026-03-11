import { Injectable } from '@nestjs/common';

@Injectable()
export class SimilarityService {
  /**
   * Jaccard similarity between two token sets
   */
  private jaccard(a: string[], b: string[]): number {
    const setA = new Set(a);
    const setB = new Set(b);

    const intersection = [...setA].filter((x) => setB.has(x)).length;
    const union = new Set([...a, ...b]).size;

    return union === 0 ? 0 : intersection / union;
  }

  /**
   * Numeric similarity (size comparison)
   */
  private numericSimilarity(a?: number, b?: number): number {
    if (!a || !b) return 0;
    const diff = Math.abs(a - b);
    return diff === 0 ? 1 : 1 / (1 + diff);
  }

  /**
   * Brand similarity (exact or partial match)
   */
  private brandSimilarity(a?: string | null, b?: string | null): number {
    if (!a || !b) return 0;
    if (a === b) return 1;
    return a.includes(b) || b.includes(a) ? 0.7 : 0;
  }

  /**
   * Category similarity
   */
  private categorySimilarity(a?: string | null, b?: string | null): number {
    if (!a || !b) return 0;
    return a === b ? 1 : 0;
  }

  /**
   * Main similarity function
   */
  computeSimilarity(a: any, b: any): number {
    const tokenSim = this.jaccard(a.tokens, b.tokens);
    const brandSim = this.brandSimilarity(a.brand, b.brand);
    const sizeSim = this.numericSimilarity(a.size, b.size);
    const categorySim = this.categorySimilarity(a.category, b.category);

    // Weighted score
    return (
      tokenSim * 0.5 +
      brandSim * 0.2 +
      sizeSim * 0.2 +
      categorySim * 0.1
    );
  }
}