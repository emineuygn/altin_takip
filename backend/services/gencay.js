const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    // Gencay için tipik fiyat alanları
    let nakit = $(".price-value").first().text() || $(".product-price").text() || $(".current-price").text();
    let kart = $(".old-price").text() || nakit;

    return {
        n: cleanPrice(nakit),
        h: cleanPrice(kart)
    };
};