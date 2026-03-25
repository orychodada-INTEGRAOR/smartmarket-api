const ProductsService = require('../services/products-service');

class ProductsController {
    static async search(req, res) {
        try {
            const { q } = req.query;
            const products = await ProductsService.search(q);
            res.json({ data: products });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProductsController;