const fs = require('fs');
const xml2js = require('xml2js');

class OISParser {

    static async parseFile(filePath) {
        try {
            const xml = fs.readFileSync(filePath, 'utf-8');
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(xml);

            // Detect if this is a promotions file
            if (result?.Root?.Promotions) {
                console.log("🏷️ Promotions file detected — skipping product parsing");
                return [];
            }

            // Extract items from XML (supports all formats)
            let items = null;

            // Case 1: <root><Items><Item>
            if (result?.root?.Items?.[0]?.Item) {
                items = result.root.Items[0].Item;
            }

            // Case 2: <root><Items><Item> (no array)
            else if (result?.root?.Items?.Item) {
                items = result.root.Items.Item;
            }

            // Case 3: <Items><Item>
            else if (result?.Items?.[0]?.Item) {
                items = result.Items[0].Item;
            }

            // Case 4: <Items><Item> (no array)
            else if (result?.Items?.Item) {
                items = result.Items.Item;
            }

            // If still nothing → empty
            if (!items) {
                console.log("❌ No items found in XML");
                return [];
            }

            // Map items to product objects
            return items.map(item => ({
                barcode: item.ItemCode?.[0] || null,
                name: item.ItemName?.[0] || 'Unknown',
                brand: item.ManufactureName?.[0] || null,
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