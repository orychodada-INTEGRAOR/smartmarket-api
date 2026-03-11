import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryClassifierService {
  /**
   * מילון קטגוריות — ניתן להרחיב בהמשך
   * כל קטגוריה מכילה רשימת מילות מפתח
   */
  private categories: Record<string, string[]> = {
    'משקאות': [
      'קולה', 'קוקה', 'פפסי', 'ספרייט', 'מים', 'סודה',
      'juice', 'cola', 'drink', 'beverage', 'soda', 'water'
    ],
    'מוצרי חלב': [
      'חלב', 'יוגורט', 'גבינה', 'שמנת', 'קוטג', 'לבן',
      'milk', 'yogurt', 'cheese', 'cream'
    ],
    'מזון יבש': [
      'פסטה', 'אורז', 'קוסקוס', 'קמח', 'סוכר', 'קטניות',
      'pasta', 'rice', 'flour', 'sugar', 'beans', 'lentils'
    ],
    'חטיפים': [
      'ביסלי', 'במבה', 'צ\'יפס', 'לייס', 'פרינגלס',
      'chips', 'snack', 'pringles', 'lays'
    ],
    'שימורים': [
      'טונה', 'תירס', 'שעועית', 'מלפפון חמוץ',
      'tuna', 'corn', 'beans', 'pickles'
    ],
    'בשר ודגים': [
      'עוף', 'בשר', 'דג', 'סטייק', 'המבורגר',
      'meat', 'chicken', 'fish', 'steak', 'burger'
    ],
    'ירקות ופירות': [
      'תפוח', 'בננה', 'עגבניה', 'מלפפון', 'תפוז',
      'apple', 'banana', 'tomato', 'cucumber', 'orange'
    ],
  };

  /**
   * Normalize text for comparison
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Detect category from full product name
   */
  extractCategoryFromName(name: string): string | null {
    const normalized = this.normalize(name);

    for (const [category, keywords] of Object.entries(this.categories)) {
      for (const keyword of keywords) {
        const normalizedKeyword = this.normalize(keyword);

        if (normalized.includes(normalizedKeyword)) {
          return category;
        }
      }
    }

    return null;
  }

  /**
   * Detect category from tokens
   */
  extractCategoryFromTokens(tokens: string[]): string | null {
    return this.extractCategoryFromName(tokens.join(' '));
  }
}