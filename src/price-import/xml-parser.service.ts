import { Injectable } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class XmlParserService {
  async parse(xmlBuffer: Buffer): Promise<any> {
    const xml = xmlBuffer.toString('utf8');

    return parseStringPromise(xml, {
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    });
  }
}