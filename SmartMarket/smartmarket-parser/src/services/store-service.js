const db = require('../config/db');
const logger = require('../utils/logger');

class StoreService {

    async insertBatch(stores) {
        let inserted = 0;

        for (const store of stores) {
            try {
                await db.query(`
                    INSERT INTO stores (
                        store_id,
                        name,
                        address,
                        city,
                        zip_code,
                        latitude,
                        longitude
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (store_id) DO NOTHING
                `, [
                    store.storeId,
                    store.name,
                    store.address,
                    store.city,
                    store.zipCode,
                    store.latitude,
                    store.longitude
                ]);

                inserted++;

            } catch (error) {
                logger.error(`Error inserting store ${store.storeId}: ${error.message}`);
            }
        }

        logger.info(`🏪 Inserted ${inserted} stores`);
        return inserted;
    }
}

module.exports = StoreService;