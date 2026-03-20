class TagDetector {

    static detect(productName, brand = '') {
        const tags = [];
        const text = (productName + ' ' + brand).toLowerCase();

        if (text.includes('טבעוני') || text.includes('vegan')) tags.push('VEGAN');
        if (text.includes('אורגני') || text.includes('organic')) tags.push('ORGANIC');
        if (text.includes('ללא גלוטן') || text.includes('gluten free')) tags.push('GLUTEN_FREE');
        if (text.includes('כשר') || text.includes('בד"צ')) tags.push('KOSHER');
        if (text.includes('דל שומן') || text.includes('0%')) tags.push('LOW_FAT');

        return tags;
    }
}

module.exports = TagDetector;