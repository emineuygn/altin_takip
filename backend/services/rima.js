const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    try {
        const scripts = $('script[type="application/ld+json"]');
        let price = null;
        scripts.each((i, el) => {
            try {
                const data = JSON.parse($(el).html());
                if (data.offers?.price) {
                    price = parseFloat(data.offers.price);
                    return false;
                }
            } catch(e) {}
        });
        if (price && price > 0) return { n: price, h: price };
    } catch(e) {}

    const fiyat = cleanPrice($('.summary .price .woocommerce-Price-amount bdi').first().text());
    return { n: fiyat, h: fiyat };
};