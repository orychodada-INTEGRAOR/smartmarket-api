const db = require('../config/db');

class Categorizer {

    constructor() {
        this.categoryMap = new Map();
    }

    async loadCategories() {
        const result = await db.query(`
            SELECT id, name_he, normalized_name_he
            FROM categories
            WHERE parent_id IS NOT NULL
        `);

        result.rows.forEach(cat => {
            this.categoryMap.set(cat.name_he, cat.id);
            this.categoryMap.set(cat.normalized_name_he, cat.id);
        });

        console.log(`Loaded ${this.categoryMap.size} categories`);
    }

    findCategory(productName) {
        const name = productName.toLowerCase();

        if (name.includes('חלב')) return this.categoryMap.get('חלב');
        if (name.includes('גבינה')) return this.categoryMap.get('גבינות');
        if (name.includes('פיצה')) return this.categoryMap.get('פיצה');
        if (name.includes('קפוא')) return this.categoryMap.get('קפואים');

        return null;
    }
}

module.exports = Categorizer;