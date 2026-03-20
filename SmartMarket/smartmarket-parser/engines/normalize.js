class Normalizer {

    static removeBrand(name, brand) {
        if (!brand) return name;
        return name.replace(new RegExp(brand, 'gi'), '').trim();
    }

    static extractNumbers(text) {
        const matches = text.match(/\d+(\.\d+)?/g);
        return matches ? matches.map(Number) : [];
    }

    static extractUnit(text) {
        const units = {
            'ליטר': 'liter',
            'מ"ל': 'ml',
            'גרם': 'gram',
            'ק"ג': 'kg',
            "יח'": 'unit',
            'חבילה': 'pack'
        };

        for (let [he, en] of Object.entries(units)) {
            if (text.includes(he)) return en;
        }

        return null;
    }

    static normalize(fullName, brand = null) {
        let normalized = fullName;

        if (brand) {
            normalized = this.removeBrand(normalized, brand);
        }

        normalized = normalized.replace(/\d+(\.\d+)?/g, '');
        normalized = normalized.replace(/(ליטר|מ"ל|גרם|ק"ג|יח'|חבילה)/g, '');
        normalized = normalized.replace(/\s+/g, ' ').trim();

        return normalized;
    }

    static generateFamilyCode(normalizedName) {
        return normalizedName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w_]/g, '');
    }
}

module.exports = Normalizer;