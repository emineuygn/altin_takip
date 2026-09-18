const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    const n = cleanPrice($('#product-price-new').first().text());
    const h = cleanPrice($('#product-price-old').first().text());

    return { n, h: h !== "-" ? h : n };
};
