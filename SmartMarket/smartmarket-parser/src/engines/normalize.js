class Normalizer {

    static normalize(name, brand = null) {
        let normalized = name;

        if (brand) {
            normalized = normalized.replace(new RegExp(brand, 'gi'), '');
        }

        normalized = normalized.replace(/\d+%/g, '');
        normalized = normalized.replace(/\d+(\.\d+)?\s*(ליטר|מ"ל|גרם|ק"ג|יח'|חבילה)/g, '');
        normalized = normalized.replace(/\d+/g, '');
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