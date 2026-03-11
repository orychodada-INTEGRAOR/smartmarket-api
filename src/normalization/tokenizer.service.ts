import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenizerService {
  private stopwords = new Set([
    'של', 'עם', 'ללא', 'חדש', 'חדש!', 'חדש!!',
    'הכי', 'גדול', 'קטן', 'משפחתי', 'בקבוק', 'אריזה',
  ]);

  /**
   * Normalize raw text before tokenizing
   */
  private clean(text: string): string {
    return text
      .toLowerCase()
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/מ\"ל/g, 'ml')
      .replace(/מ״ל/g, 'ml')
      .replace(/מ"ל/g, 'ml')
      .replace(/ליטר/g, 'l')
      .replace(/גרם/g, 'g')
      .replace(/ק\"ג/g, 'kg')
      .replace(/ק״ג/g, 'kg')
      .replace(/ק"ג/g, 'kg')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Split into tokens
   */
  private split(text: string): string[] {
    return text
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  /**
   * Remove stopwords
   */
  private removeStopwords(tokens: string[]): string[] {
    return tokens.filter((t) => !this.stopwords.has(t));
  }

  /**
   * Extract numeric tokens (e.g., "1.5l" → ["1.5", "l"])
   */
  private expandUnits(tokens: string[]): string[] {
    const expanded: string[] = [];

    for (const token of tokens) {
      const match = token.match(/^(\d+(\.\d+)?)(ml|l|g|kg)$/i);
      if (match) {
        expanded.push(match[1]); // numeric part
        expanded.push(match[3].toLowerCase()); // unit
      } else {
        expanded.push(token);
      }
    }

    return expanded;
  }

  /**
   * Main tokenize function
   */
  tokenize(text: string): string[] {
    if (!text) return [];

    const cleaned = this.clean(text);
    let tokens = this.split(cleaned);
    tokens = this.expandUnits(tokens);
    tokens = this.removeStopwords(tokens);

    return tokens;
  }

  /**
   * Convert tokens to a single search string
   */
  toSearchString(tokens: string[]): string {
    return tokens.join(' ').trim();
  }
}