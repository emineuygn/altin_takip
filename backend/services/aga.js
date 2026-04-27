const cheerio = require('cheerio');

/**
 * AGA Külçe Özel Parser
 * Analiz: Fiyatlar 'first-line' içindeki strong etiketlerinde bulunuyor.
 * K.Kartı Fiyatı -> last-price class'ında
 * Havale/Nakit -> first-line içindeki değerlerden biri
 */
module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    // 1. Nakit/Havale Fiyatı Analizi
    // Sitede genelde "Havale Fiyatı" ibaresi geçen yerin yanındaki strong değeridir
    let nakit = "-";
    $(".product-detail-content-box").each((i, el) => {
        const text = $(el).text();
        if (/Havale|Nakit/i.test(text)) {
            nakit = $(el).find("strong").text();
        }
    });

    // 2. Kredi Kartı Fiyatı Analizi (Ekran görüntünde net görünen last-price)
    const kart = $(".last-price").first().text();

    // 3. Ekstra Güvenlik: Eğer yukarıdakiler boşsa JSON-LD'den çekmeyi dene
    let fallbackPrice = "-";
    try {
        const jsonLdText = $('script[type="application/ld+json"]').html();
        if (jsonLdText) {
            const jsonData = JSON.parse(jsonLdText);
            // jsonData.offers.price genelde nakit fiyattır
            fallbackPrice = jsonData.offers?.price || "-";
        }
    } catch (e) {
        console.log("AGA JSON parse hatası");
    }

    return {
        n: nakit !== "-" ? cleanPrice(nakit) : cleanPrice(fallbackPrice),
        h: cleanPrice(kart)
    };
};