const fs = require('fs');
const zlib = require('zlib');
const logger = require('../utils/logger');

async function extractGzip(gzPath, xmlPath) {
  return new Promise((resolve, reject) => {
    try {
      const gunzip = zlib.createGunzip();
      const input = fs.createReadStream(gzPath);
      const output = fs.createWriteStream(xmlPath);

      gunzip.on('error', (err) => {
        logger.error(`Gunzip error: ${err.message}`);
        reject(err);
      });

      input.on('error', (err) => {
        logger.error(`Input error: ${err.message}`);
        reject(err);
      });

      output.on('error', (err) => {
        logger.error(`Output error: ${err.message}`);
        reject(err);
      });

      output.on('finish', () => {
        logger.info(`Extracted: ${xmlPath}`);
        try {
          fs.unlinkSync(gzPath);
          logger.info(`Deleted gz: ${gzPath}`);
        } catch (e) {
          logger.warn(`Could not delete gz: ${e.message}`);
        }
        resolve(true);
      });

      input.pipe(gunzip).pipe(output);

    } catch (err) {
      logger.error(`Extract error: ${err.message}`);
      reject(err);
    }
  });
}

module.exports = { extractGzip };