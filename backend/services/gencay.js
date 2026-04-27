const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // Ürün sayfasındaki asıl fiyat bloğu: div#eft-price ve div#credit-card-price
    // (p.eft-price class'lı olanlar ilgisiz ürünler, onları atlıyoruz)
    const havale = $('div#eft-price .woocommerce-Price-amount bdi').first().text();
    const kart   = $('div#credit-card-price .woocommerce-Price-amount bdi').first().text();

    return {
        n: cleanPrice(kart   || havale),  // normal fiyat = kredi kartı fiyatı
        h: cleanPrice(havale)             // havale/EFT fiyatı
    };
};