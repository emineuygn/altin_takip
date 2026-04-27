const cheerio = require('cheerio');

/**
 * Topaloğlu Altın Özel Parser
 * Analiz: 
 * - Normal Fiyat: .product-price-new sınıfı içinde.
 * - Havale Fiyatı: .product-list-row içinde "Havale" metni aranarak yanındaki .product-list-content'ten çekilir.
 */
module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // 1. Normal/Kartlı Fiyat (Ekranda büyük görünen ana fiyat)
    const normalFiyatText = $(".product-price-new").first().text();

    // 2. Havale Fiyatı (Liste satırları arasından "Havale" içeren satırı buluyoruz)
    let havaleFiyatText = "-";
    $(".product-list-row").each((i, el) => {
        const rowTitle = $(el).find(".product-list-title").text();
        if (/Havale/i.test(rowTitle)) {
            havaleFiyatText = $(el).find(".product-list-content").text();
        }
    });

    // Eğer havale fiyatı listede bulunamazsa normal fiyatı baz alalım
    const n = havaleFiyatText !== "-" ? cleanPrice(havaleFiyatText) : cleanPrice(normalFiyatText);
    const h = cleanPrice(normalFiyatText);

    return {
        n: n, // Havale/İndirimli sütununda görünecek
        h: h, // Normal sütunda görünecek
        a: "-" // Ajda yok, çizgi çekiyoruz
    };
};