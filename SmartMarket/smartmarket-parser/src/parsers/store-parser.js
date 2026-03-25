const xml2js = require('xml2js');

class StoreParser {

    static async parse(xml) {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml);

        const stores =
            result?.Root?.Stores?.[0]?.Store ||
            result?.Stores?.[0]?.Store ||
            [];

        return stores.map(store => ({
            id: store.StoreID?.[0],
            name: store.StoreName?.[0],
            address: store.Address?.[0],
            city: store.City?.[0]
        }));
    }
}

module.exports = StoreParser;