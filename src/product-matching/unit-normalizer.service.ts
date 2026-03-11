import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitNormalizerService {
  normalizeUnits(text: string) {
    let normalized = text.toLowerCase();

    normalized = normalized.replace("ליטר", "l");
    normalized = normalized.replace("ל'", "l");
    normalized = normalized.replace("ל", "l");

    normalized = normalized.replace("מ\"ל", "ml");
    normalized = normalized.replace("מל", "ml");

    return normalized;
  }

  extractSize(text: string) {
    const liter = text.match(/(\d+(\.\d+)?)\s*l/);

    if (liter) {
      return {
        value: parseFloat(liter[1]),
        unit: "l"
      };
    }

    const ml = text.match(/(\d+)\s*ml/);

    if (ml) {
      return {
        value: parseFloat(ml[1]) / 1000,
        unit: "l"
      };
    }

    return null;
  }
}