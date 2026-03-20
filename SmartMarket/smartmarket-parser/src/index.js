require('dotenv').config();
const fs = require('fs');
const path = require('path');

const OISParser = require('./parsers/ois-parser');
const ProductService = require('./services/product');

async function main() {

    console.log('🚀 SmartMarket Parser Starting...\n');

    const productService = new ProductService();
    await productService.categorizer.loadCategories();

    const dumpsDir = process.env.DUMPS_DIR;

    const files = fs.readdirSync(dumpsDir)
        .filter(f => f.includes('Price') && f.endsWith('.xml'));

    for (const file of files) {
        const filePath = path.join(dumpsDir, file);
        console.log('📄 Processing:', file);

        const products = await OISParser.parseFile(filePath);

        for (const product of products) {
            await productService.insertProduct(product);
        }
    }

    console.log('\n🎉 Parser Complete');
}

main();