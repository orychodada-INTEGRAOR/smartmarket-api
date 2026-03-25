const xml2js = require('xml2js');

class PromotionParser {

    static async parse(xml) {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml);

        const promotions =
            result?.Root?.Promotions?.[0]?.Promotion ||
            result?.Promotions?.[0]?.Promotion ||
            [];

        return promotions.map(promo => ({
            id: promo.PromotionID?.[0],
            description: promo.PromotionDescription?.[0],
            start: promo.PromotionStartDateTime?.[0],
            end: promo.PromotionEndDateTime?.[0]
        }));
    }
}

module.exports = PromotionParser;