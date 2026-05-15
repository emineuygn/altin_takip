const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // Önce price-amount dene (ajda/çeyrek sayfaları)
    let n = cleanPrice($('.price-amount.md\\:text-3xl').first().text());
    
    // Bulamazsan product-price dene (gram sayfaları)
    if (n === '-') {
        n = cleanPrice($('div.product-price').first().text());
    }

    return { n, h: '-' };
};