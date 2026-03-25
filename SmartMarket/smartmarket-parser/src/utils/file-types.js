const FileTypes = {
    PRODUCTS: 'products',
    PROMOTIONS: 'promotions',
    STORES: 'stores',
    UNKNOWN: 'unknown'
};

function detectFileType(xml, fileName) {

    if (xml.includes('<Items>')) return FileTypes.PRODUCTS;
    if (xml.includes('<Promotions>')) return FileTypes.PROMOTIONS;
    if (xml.includes('<Store>') && xml.includes('<Address>')) return FileTypes.STORES;

    if (fileName.includes('PriceFull')) return FileTypes.PRODUCTS;
    if (fileName.includes('PromoFull')) return FileTypes.PROMOTIONS;

    return FileTypes.UNKNOWN;
}

module.exports = { FileTypes, detectFileType };