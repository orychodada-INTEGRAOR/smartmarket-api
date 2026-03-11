import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandExtractorService {
  /**
   * רשימת מותגים — ניתן להרחיב בהמשך
   */
  private brands = [
    // English
    'coca cola',
    'coca-cola',
    'coke',
    'pepsi',
    'nestle',
    'strauss',
    'elite',
    'tara',
    'milka',
    'oreo',
    'heinz',
    'lays',
    'pringles',

    // Hebrew
    'קוקה קולה',
    'קוקה-קולה',
    'פפסי',
    'נסטלה',
    'שטראוס',
    'עלית',
    'טרה',
    'תנובה',
    'מילקה',
    'אוראו',
    'היינץ',
    'לייס',
    'פרינגלס',
  ];

  /**
   * Normalize brand text for comparison
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/-/g, ' ')
      .replace(/"/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Try to detect brand from full product name
   */
  extractBrandFromName(name: string): string | null {
    const normalizedName = this.normalize(name);

    for (const brand of this.brands) {
      const normalizedBrand = this.normalize(brand);

      if (normalizedName.includes(normalizedBrand)) {
        return brand;
      }
    }

    return null;
  }

  /**
   * Try to detect brand from tokens
   */
  extractBrandFromTokens(tokens: string[]): string | null {
    const joined = tokens.join(' ');

    return this.extractBrandFromName(joined);
  }
}