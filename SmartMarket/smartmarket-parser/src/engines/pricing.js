class PricingEngine {

    static pricePerUnit(price, quantity) {
        if (!quantity || quantity === 0) return null;
        return (price / quantity).toFixed(2);
    }
}

module.exports = PricingEngine;