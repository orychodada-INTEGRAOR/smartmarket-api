import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandDictionaryService {
  private brandMap: Record<string, string> = {
    "קוקה": "coca cola",
    "קוקה קולה": "coca cola",
    "קוקה-קולה": "coca cola",
    "coca": "coca cola",
    "coca cola": "coca cola",

    "pepsi": "pepsi",
    "פפסי": "pepsi",

    "שטראוס": "strauss",
    "strauss": "strauss",

    "תנובה": "tnuva",
    "tnuva": "tnuva",

    "אסם": "osem",
    "osem": "osem"
  };

  normalizeBrand(text: string): string | null {
    const lower = text.toLowerCase();

    for (const key of Object.keys(this.brandMap)) {
      if (lower.includes(key)) {
        return this.brandMap[key];
      }
    }

    return null;
  }
}