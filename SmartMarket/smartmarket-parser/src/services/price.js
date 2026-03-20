const db = require('../../config/db');

class PriceService {

    async insertPrice(productId, chainId, price) {
        try {
            await db.query(`
                INSERT INTO prices (product_id, chain_id, price)
                VALUES ($1, $2, $3)
            `, [productId, chainId, price]);
        } catch (err) {
            console.error("Price insert error:", err.message);
        }
    }
}

module.exports = PriceService;