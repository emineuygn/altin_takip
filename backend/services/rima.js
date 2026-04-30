const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    try {
        const jsonLd = $('script[type="application/ld+json"]').html();
        if (jsonLd) {
            const data = JSON.parse(jsonLd);
            const price = parseFloat(data.offers?.price || data.price || 0);
            if (price > 0) return { n: price, h: price };
        }
    } catch(e) {}

    const fiyat = cleanPrice($('.summary .price .woocommerce-Price-amount bdi').first().text());
    return { n: fiyat, h: fiyat };
};