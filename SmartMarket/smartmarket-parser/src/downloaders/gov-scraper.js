const axios = require('axios');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');
const logger = require('../utils/logger');

const GOV_URL = "https://www.gov.il/he/pages/cpfta_prices_regulations";

const CHAINS = {
    "Shufersal": "7290103152017",
    "RamiLevy": "7290696200003",
    "Victory": "7290874500006",
    "Yohananof": "7290058179503",
    "OsherAd": "7290633800006"
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function extractGzip(gzPath, xmlPath) {
    return new Promise((resolve, reject) => {
        const input = fs.createReadStream(gzPath);
        const output = fs.createWriteStream(xmlPath);
        const gunzip = zlib.createGunzip();

        input.pipe(gunzip).pipe(output);

        output.on('finish', resolve);
        output.on('error', reject);
    });
}

async function downloadFile(url, dest) {
    logger.info(`⬇️ Downloading: ${url}`);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    await pipeline(response.data, fs.createWriteStream(dest));

    logger.info(`💾 Saved: ${dest}`);
}

async function run() {
    logger.info("🌐 Fetching gov.il page...");

    const response = await axios.get(GOV_URL);
    const html = response.data;

    const links = [...html.matchAll(/https:\/\/prices\.gov\.il\/PriceFiles\/[^"]+/g)]
        .map(m => m[0]);

    logger.info(`🔗 Found ${links.length} links`);

    const dumpsDir = process.env.DUMPS_DIR;
    ensureDir(dumpsDir);

    for (const [chainName, chainId] of Object.entries(CHAINS)) {
        const chainDir = path.join(dumpsDir, chainName);
        ensureDir(chainDir);

        const chainLinks = links.filter(l => l.includes(chainId));

        logger.info(`🏪 ${chainName}: found ${chainLinks.length} files`);

        for (const url of chainLinks) {
            const fileName = url.split('/').pop();
            const gzPath = path.join(chainDir, fileName);
            const xmlPath = gzPath.replace('.gz', '');

            await downloadFile(url, gzPath);
            await extractGzip(gzPath, xmlPath);
            fs.unlinkSync(gzPath);
        }
    }

    logger.info("🎉 Download complete!");
}

if (require.main === module) {
    run();
}

module.exports = { run };