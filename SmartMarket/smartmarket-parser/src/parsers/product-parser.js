const xml2js = require('xml2js');

class ProductParser {

    static async parse(xml) {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml);

        let items =
            result?.root?.Items?.[0]?.Item ||
            result?.root?.Items?.Item ||
            result?.Items?.[0]?.Item ||
            result?.Items?.Item ||
            [];

        return items.map(item => ({
            barcode: item.ItemCode?.[0] || null,
            name: item.ItemName?.[0] || 'Unknown',
            brand: item.ManufactureName?.[0] || null,
            price: parseFloat(item.ItemPrice?.[0]) || 0,
            unitType: item.UnitOfMeasure?.[0] || null
        }));
    }
}

module.exports = ProductParser;