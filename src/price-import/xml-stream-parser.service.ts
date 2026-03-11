import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as sax from 'sax';

@Injectable()
export class XmlStreamParserService {
  async parseItems(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const items: any[] = [];

      const parser = sax.createStream(true, {
        trim: true,
        normalize: true,
      });

      let currentItem: any = null;
      let currentTag: string | null = null;

      parser.on('opentag', (node) => {
        if (node.name === 'Item') {
          currentItem = {};
        }
        currentTag = node.name;
      });

      parser.on('text', (text) => {
        if (!currentItem || !currentTag) return;
        currentItem[currentTag] = text;
      });

      parser.on('closetag', (tagName) => {
        if (tagName === 'Item') {
          items.push(currentItem);
          currentItem = null;
        }
        currentTag = null;
      });

      parser.on('error', (err) => reject(err));
      parser.on('end', () => resolve(items));

      const stream = fs.createReadStream(filePath);
      stream.pipe(parser);
    });
  }
}