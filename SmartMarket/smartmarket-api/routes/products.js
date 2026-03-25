const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/products-controller');

router.get('/search', ProductsController.search);

module.exports = router;