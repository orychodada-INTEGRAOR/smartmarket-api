const db = require('../../config/db');
const Normalizer = require('../../engines/normalize');
const Categorizer = require('../../engines/categorize');

class ProductService {

    constructor() {
        this.categorizer = new Categorizer();
    }

    async insertProduct(product) {
        const { barcode, name, brand, price, unitType } = product;

        const normalized = Normalizer.normalize(name, brand);
        const familyCode = Normalizer.generateFamilyCode(normalized);
        const categoryId = this.categorizer.findCategory(name);

        try {
            const result = await db.query(`
                INSERT INTO products (barcode, name_he, brand, normalized_name_he, family_code, category_id, unit_type)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (barcode)
                DO UPDATE SET name_he = EXCLUDED.name_he
                RETURNING id
            `, [barcode, name, brand, normalized, familyCode, categoryId, unitType]);

            return result.rows[0].id;

        } catch (err) {
            console.error('Error inserting product:', err.message);
            return null;
        }
    }
}

module.exports = ProductService;