const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // h1 başlığını bul, oradan yukarı çıkarak fiyat kutusunu bul
    const h1 = $('h1.entry-title, h1.product_title').first();
    const container = h1.closest('.summary, .entry-summary, .product-image-summary');
    
    const getPrice = (selector) => {
        const scope = container.length ? container : $('body');
        const boxes = scope.find(selector);
        if (!boxes.length) return "-";
        const box = boxes.last(); // son eşleşmeyi al - ürün sayfasındaki
        const tutar = box.find('span.tutar').contents().first().text().trim();
        const kurus = box.find('span.kucuk-kurus').text().trim();
        if (!tutar) return "-";
        const num = parseFloat(`${tutar}${kurus}`.replace(/\./g, '').replace(',', '.'));
        return isNaN(num) ? "-" : num;
    };

    const normal = getPrice('div.fiyat-box.kredi');
    const havale = getPrice('div.fiyat-box.havale');

    return {
        n: normal !== "-" ? normal : havale,
        h: havale !== "-" ? havale : normal
    };
};