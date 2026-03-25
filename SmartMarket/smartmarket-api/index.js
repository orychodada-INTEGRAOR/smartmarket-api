require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const productsRoute = require('./routes/products');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/products', productsRoute);

app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'SmartMarket API' });
});

app.listen(4000, () => {
    console.log("🚀 SmartMarket API running on port 4000");
});