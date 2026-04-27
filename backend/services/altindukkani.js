const cheerio = require('cheerio');

/**
 * Altın Dükkanı Özel Parser
 * Analiz: Havale indirimi yoksa, sadece ekrandaki ana satış fiyatını çekiyoruz.
 */
module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // Sitedeki ana satış fiyatı (product-price içindeki span)
    const anaFiyatText = $(".product-current-price .product-price").first().text();

    const fiyat = cleanPrice(anaFiyatText);

    return {
        n: fiyat, // Ana fiyat sütununda bu görünecek
        h: "-"    // Havale/Kart ayrımı olmadığı için burayı boş (çizgi) bırakıyoruz
    };
};