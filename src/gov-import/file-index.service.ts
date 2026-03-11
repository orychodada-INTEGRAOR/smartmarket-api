import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

type FileIndexEntry = {
  file: string;
  url: string;
};

@Injectable()
export class FileIndexService {
  private readonly logger = new Logger(FileIndexService.name);

  private parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    trimValues: true,
  });

  async getLatestPriceFileUrl(indexUrl: string): Promise<string> {
    this.logger.log(`Downloading FileIndex from: ${indexUrl}`);

    const res = await axios.get(indexUrl, {
      responseType: 'text',
      timeout: 30000,
    });

    const xml = this.parser.parse(res.data);

    const files = this.extractFiles(xml);

    if (!files.length) {
      throw new Error('No files found in FileIndex');
    }

    const latest = files.sort((a, b) =>
      String(b.file).localeCompare(String(a.file)),
    )[0];

    this.logger.log(`Latest file detected: ${latest.file}`);

    return latest.url;
  }

  private extractFiles(xml: any): FileIndexEntry[] {
    const candidates: FileIndexEntry[] = [];

    const tryPush = (node: any) => {
      if (!node) return;

      if (Array.isArray(node)) {
        node.forEach(tryPush);
        return;
      }

      if (node.FileNm || node.FileName) {
        candidates.push({
          file: node.FileNm || node.FileName,
          url: node.Url || node.FileUrl,
        });
      }

      Object.values(node).forEach(tryPush);
    };

    tryPush(xml);

    return candidates.filter((f) => !!f.url);
  }
}