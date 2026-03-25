const db = require('../config/db');

class ProductsService {
    static async search(q) {
        const result = await db.query(`
            SELECT * FROM products
            WHERE normalized_name ILIKE $1
            LIMIT 50
        `, [`%${q}%`]);

        return result.rows;
    }
}

module.exports = ProductsService;