import { Injectable } from '@nestjs/common';

@Injectable()
export class SizeExtractorService {
  /**
   * תבניות לזיהוי גדלים:
   * 1.5L, 500ml, 200g, 1kg, 330 ml, 2 ליטר, 200 גרם, 1 ק"ג
   */
  private patterns = [
    /(\d+(\.\d+)?)\s?(ml|מ\"ל|מ״ל|מ"ל)/i,
    /(\d+(\.\d+)?)\s?(l|ליטר)/i,
    /(\d+(\.\d+)?)\s?(g|גרם)/i,
    /(\d+(\.\d+)?)\s?(kg|ק\"ג|ק״ג|ק"ג)/i,
  ];

  /**
   * Normalize unit to standard English form
   */
  private normalizeUnit(unit: string): string {
    const u = unit.toLowerCase();

    if (['ml', 'מ"ל', 'מ״ל', 'מ\"ל'].includes(u)) return 'ml';
    if (['l', 'ליטר'].includes(u)) return 'l';
    if (['g', 'גרם'].includes(u)) return 'g';
    if (['kg', 'ק"ג', 'ק״ג', 'ק\"ג'].includes(u)) return 'kg';

    return u;
  }

  /**
   * Extract size from product name
   */
  extractSize(name: string): { value: number; unit: string } | null {
    const lower = name.toLowerCase();

    for (const pattern of this.patterns) {
      const match = lower.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = this.normalizeUnit(match[3]);
        return { value, unit };
      }
    }

    return null;
  }

  /**
   * Extract size from tokens (optional)
   */
  extractSizeFromTokens(tokens: string[]) {
    return this.extractSize(tokens.join(' '));
  }
}