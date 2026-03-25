const ProductParser = require('./product-parser');
const PromotionParser = require('./promotion-parser');
const StoreParser = require('./store-parser');
const { FileTypes } = require('../utils/file-types');

class ParserFactory {

    static async parse(xml, type) {

        switch (type) {

            case FileTypes.PRODUCTS:
                return await ProductParser.parse(xml);

            case FileTypes.PROMOTIONS:
                return await PromotionParser.parse(xml);

            case FileTypes.STORES:
                return await StoreParser.parse(xml);

            default:
                console.log('⚠️ Unknown file type — skipping');
                return [];
        }
    }
}

module.exports = ParserFactory;