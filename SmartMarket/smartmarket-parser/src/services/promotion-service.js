const db = require('../config/db');
const logger = require('../utils/logger');

class PromotionService {

    async insertBatch(promotions) {
        let inserted = 0;

        for (const promo of promotions) {
            try {
                await db.query(`
                    INSERT INTO promotions (
                        promotion_id,
                        description,
                        start_date,
                        end_date,
                        discount_type,
                        discount_rate
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (promotion_id) DO NOTHING
                `, [
                    promo.promotionId,
                    promo.description,
                    promo.startDate,
                    promo.endDate,
                    promo.discountType,
                    promo.discountRate
                ]);

                inserted++;

            } catch (error) {
                logger.error(`Error inserting promotion ${promo.promotionId}: ${error.message}`);
            }
        }

        logger.info(`🏷️ Inserted ${inserted} promotions`);
        return inserted;
    }
}

module.exports = PromotionService;