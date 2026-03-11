import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import * as unzipper from 'unzipper';

@Injectable()
export class DownloaderService {
  async downloadFile(url: string, destination: string): Promise<string> {
    console.log(`Downloading: ${url}`);

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios({
          method: 'GET',
          url,
          responseType: 'stream',
          timeout: 60000,
        });

        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(destination);

          response.data.pipe(writer);

          writer.on('finish', () => resolve(null));
          writer.on('error', reject);
        });

        console.log(`Downloaded to: ${destination}`);
        return destination;
      } catch (error) {
        console.log(`Download failed (attempt ${attempt})`);
        if (attempt === maxRetries) throw error;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    throw new Error('Download failed');
  }

  async extractIfNeeded(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.gz') return this.extractGzip(filePath);
    if (ext === '.zip') return this.extractZip(filePath);

    return filePath;
  }

  private async extractGzip(filePath: string): Promise<string> {
    const outputPath = filePath.replace('.gz', '');

    console.log(`Extracting GZIP: ${filePath}`);

    const source = fs.createReadStream(filePath);
    const destination = fs.createWriteStream(outputPath);

    await new Promise((resolve, reject) => {
      source
        .pipe(zlib.createGunzip())
        .pipe(destination)
        .on('finish', () => resolve(null))
        .on('error', reject);
    });

    return outputPath;
  }

  private async extractZip(filePath: string): Promise<string> {
    console.log(`Extracting ZIP: ${filePath}`);

    const directory = path.dirname(filePath);
    const directoryStream = await unzipper.Open.file(filePath);
    const file = directoryStream.files[0];

    const outputPath = path.join(directory, file.path);

    await new Promise((resolve, reject) => {
      file
        .stream()
        .pipe(fs.createWriteStream(outputPath))
        .on('finish', () => resolve(null))
        .on('error', reject);
    });

    return outputPath;
  }
}