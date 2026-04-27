const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    return {
        n: cleanPrice($("#salePrice").text()), // İndirimli fiyat
        h: cleanPrice($("#transferPrice").text()) // Havale fiyatı
    };
};