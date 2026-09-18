const cheerio = require('cheerio');

/**
 * Altın Dükkanı Özel Parser
 * Site 1 gr külçe satmıyor (en küçük ürünleri 5 gr), o yüzden 5 gr ürününü
 * çekip server.js'de 5'e bölerek "1 gram eşdeğeri" hesaplıyoruz.
 * .product-price = kredi kartı fiyatı, .product-price-not-discounted = havale fiyatı.
 */
module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    const kartFiyat = cleanPrice($(".product-price").first().text());
    const havaleFiyat = cleanPrice($(".product-price-not-discounted").first().text());

    return {
        n: kartFiyat,
        h: havaleFiyat !== "-" ? havaleFiyat : kartFiyat
    };
};
