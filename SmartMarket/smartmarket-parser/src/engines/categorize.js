const fs = require('fs');
const path = require('path');

class Categorizer {

    constructor() {
        this.categories = [];
    }

    async loadCategories() {
        const file = path.join(__dirname, '../../data/categories.json');
        this.categories = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }

    findCategory(productName) {
        if (!productName) return null;

        const name = productName.toLowerCase();

        for (const cat of this.categories) {
            for (const keyword of cat.keywords) {
                if (name.includes(keyword.toLowerCase())) {
                    return cat.id;
                }
            }
        }

        return null;
    }
}

module.exports = Categorizer;