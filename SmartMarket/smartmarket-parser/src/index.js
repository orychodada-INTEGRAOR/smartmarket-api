require('dotenv').config();
const fs = require('fs');
const path = require('path');

const ParserFactory = require('./parsers/parser-factory');
const ProductService = require('./services/product-service');
const PromotionService = require('./services/promotion-service');
const StoreService = require('./services/store-service');

const ParsingStats = require('./utils/stats');
const logger = require('./utils/logger');
const { FileTypes } = require('./utils/file-types');

async function main() {

    logger.info('🚀 SmartMarket Multi-Parser Starting...\n');

    const stats = new ParsingStats();

    // Services
    const productService = new ProductService();
    const promotionService = new PromotionService();
    const storeService = new StoreService();

    // Load categories
    await productService.categorizer.loadCategories();

    // Root dumps directory
    const dumpsDir = process.env.DUMPS_DIR;

    if (!fs.existsSync(dumpsDir)) {
        logger.error(`❌ Directory not found: ${dumpsDir}`);
        return;
    }

    // Detect chains (subfolders)
    const chains = fs.readdirSync(dumpsDir)
        .filter(item => {
            const itemPath = path.join(dumpsDir, item);
            return fs.statSync(itemPath).isDirectory();
        });

    logger.info(`📦 Found ${chains.length} chains\n`);

    // Process each chain folder
    for (const chainName of chains) {

        logger.info(`\n🏪 Processing chain: ${chainName}`);

        const chainPath = path.join(dumpsDir, chainName);

        const files = fs.readdirSync(chainPath)
            .filter(f => f.endsWith('.xml') || f.endsWith('.gz'));

        logger.info(`📄 Found ${files.length} files`);

        for (const file of files) {

            const filePath = path.join(chainPath, file);

            try {
                // Parse file
                const result = await ParserFactory.parse(filePath);

                stats.increment('filesProcessed');

                // Insert based on type
                if (result.type === FileTypes.PRODUCTS && result.data.length > 0) {
                    const count = await productService.insertBatch(result.data);
                    stats.increment('productsInserted', count);
                    stats.trackChain(chainName, 'products', count);
                    logger.info(`  ✅ ${file}: ${count} products`);
                }

                else if (result.type === FileTypes.PROMOTIONS && result.data.length > 0) {
                    const count = await promotionService.insertBatch(result.data);
                    stats.increment('promotionsInserted', count);
                    stats.trackChain(chainName, 'promotions', count);
                    logger.info(`  🏷️ ${file}: ${count} promotions`);
                }

                else if (result.type === FileTypes.STORES && result.data.length > 0) {
                    const count = await storeService.insertBatch(result.data, chainName);
                    stats.increment('storesInserted', count);
                    stats.trackChain(chainName, 'stores', count);
                    logger.info(`  🏪 ${file}: ${count} stores`);
                }

                else {
                    stats.increment('filesSkipped');
                    logger.warn(`  ⚠️ ${file}: No data or unknown type`);
                }

            } catch (error) {
                stats.increment('errorsEncountered');
                logger.error(`  ❌ ${file}: ${error.message}`);
            }
        }
    }

    // Final report
    stats.report();

    logger.info('🎉 Parsing Complete!');
    process.exit(0);
}

main().catch(error => {
    logger.error('💥 Fatal error:', error);
    process.exit(1);
});