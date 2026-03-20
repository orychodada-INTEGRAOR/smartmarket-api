const fs = require('fs');
const xml2js = require('xml2js');

class OISParser {

    static async parseFile(filePath) {
        try {
            const xml = fs.readFileSync(filePath, 'utf-8');
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(xml);

            const items = result.root.Items[0].Item;

            return items.map(item => ({
                barcode: item.ItemCode?.[0] || null,
                name: item.ItemName?.[0] || 'Unknown',
                brand: item.ManufacturerName?.[0] || null,
                price: parseFloat(item.ItemPrice?.[0]) || 0,
                unitType: item.UnitOfMeasure?.[0] || null
            }));

        } catch (err) {
            console.error('Error parsing file:', err.message);
            return [];
        }
    }
}

module.exports = OISParser;