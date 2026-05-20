const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // n = Kredi Kartı (büyük fiyat, text-dark)
    const n = cleanPrice($('.price-amount.md\\:text-1xl').first().text());

    // h = Havale/EFT (küçük fiyat, text-secondary)
    const h = cleanPrice($('.price-amount.md\\:text-3xl').first().text());

    return { n, h };
};