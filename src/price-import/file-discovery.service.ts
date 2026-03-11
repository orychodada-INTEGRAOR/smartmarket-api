// src/price-import/file-discovery.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class FileDiscoveryService {
  async findLatestFile(baseUrl: string, type: string = 'PriceFull'): Promise<string> {
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);

    const links: string[] = [];

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      if (href.includes(type)) {
        links.push(href);
      }
    });

    if (!links.length) {
      throw new Error(`No files found for type ${type} at ${baseUrl}`);
    }

    links.sort();
    const latest = links[links.length - 1];

    return baseUrl + latest;
  }
}