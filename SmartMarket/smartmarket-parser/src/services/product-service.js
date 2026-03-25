const db = require('../config/db');
const Normalizer = require('../engines/normalize');
const Categorizer = require('../engines/categorize');
const logger = require('../utils/logger');

class ProductService {

    constructor() {
        this.categorizer = new Categorizer();
    }

    async insertBatch(products) {
        let inserted = 0;
        let duplicates = 0;

        for (const product of products) {
            try {
                if (!product.barcode) continue;

                const normalized = Normalizer.normalize(product.name, product.brand);
                const familyCode = Normalizer.generateFamilyCode(normalized);
                const categoryId = this.categorizer.findCategory(product.name);

                await db.query(`
                    INSERT INTO products (
                        barcode, name, brand,
                        normalized_name, family_code,
                        category_id, unit_quantity, unit_type,
                        image_url, is_active
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
                    ON CONFLICT (barcode) DO UPDATE SET
                        name = EXCLUDED.name,
                        updated_at = NOW()
                `, [
                    product.barcode,
                    product.name,
                    product.brand,
                    normalized,
                    familyCode,
                    categoryId,
                    product.unitQuantity,
                    product.unitType,
                    product.imageUrl
                ]);

                inserted++;

            } catch (error) {
                if (error.code === '23505') {
                    duplicates++;
                } else {
                    logger.error(`Error inserting product ${product.barcode}: ${error.message}`);
                }
            }
        }

        logger.info(`Inserted ${inserted} products (${duplicates} duplicates)`);
        return inserted;
    }
}

module.exports = ProductService;