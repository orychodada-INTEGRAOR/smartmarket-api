const db = require('../../config/db');

class StoreService {

    async insertStore(store) {
        const { storeId, name, address, lat, lng } = store;

        try {
            await db.query(`
                INSERT INTO stores (store_id, name, address, lat, lng)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (store_id)
                DO NOTHING
            `, [storeId, name, address, lat, lng]);
        } catch (err) {
            console.error("Store insert error:", err.message);
        }
    }
}

module.exports = StoreService;