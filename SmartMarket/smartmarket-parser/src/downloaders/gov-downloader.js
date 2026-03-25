const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const logger = require("../utils/logger");
const { ensureDir, sleep } = require("./utils");
const { extractGzip } = require("./extract");
const CHAINS = require("./chain-urls");

const DUMPS_DIR = process.env.DUMPS_DIR || path.join(__dirname, "../../dumps");

async function downloadFile(url, dest, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`⬇️ Downloading: ${url} (attempt ${attempt}/${retries})`);

      const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
        timeout: 120000
      });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(dest);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      logger.info(`💾 Saved: ${dest}`);
      return true;
    } catch (err) {
      logger.warn(`⚠️ Download failed: ${err.message}`);
      if (attempt < retries) {
        await sleep(2000 * attempt);
        logger.info("🔁 Retrying...");
      }
    }
  }

  logger.error(`❌ Failed after ${retries} attempts: ${url}`);
  return false;
}

async function downloadChain(chainName, chainConfig) {
  logger.info(`\n🏪 Processing chain: ${chainName}`);

  const chainDir = path.join(DUMPS_DIR, chainName);
  ensureDir(chainDir);

  const { primary, fallback, gov } = chainConfig.urls;

  const sources = [
    { label: "Primary", list: primary },
    { label: "Fallback", list: fallback },
    { label: "Gov.il", list: gov }
  ];

  for (const source of sources) {
    if (!source.list || source.list.length === 0) continue;

    logger.info(`🔍 Trying ${source.label} sources...`);

    for (const url of source.list) {
      const fileName = url.split("/").pop();
      const gzPath = path.join(chainDir, fileName);
      const xmlPath = gzPath.replace(".gz", "");

      const ok = await downloadFile(url, gzPath);
      if (!ok) continue;

      const extracted = await extractGzip(gzPath, xmlPath);
      if (!extracted) continue;

      logger.info(`🎉 Success from ${source.label}: ${fileName}`);
      return;
    }

    logger.warn(`⚠️ ${source.label} failed for ${chainName}`);
  }

  logger.error(`❌ All sources failed for ${chainName}`);
}

async function main() {
  logger.info("🚀 SmartMarket Downloader Starting...\n");

  ensureDir(DUMPS_DIR);

  for (const [chainName, chainConfig] of Object.entries(CHAINS)) {
    await downloadChain(chainName, chainConfig);
  }

  logger.info("\n🎉 Download complete!");
}

main().catch(err => {
  logger.error(`💥 Fatal error: ${err.message}`);
  process.exit(1);
});