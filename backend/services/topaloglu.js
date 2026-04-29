const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // Normal fiyat - devtools'da product-price-old görünüyor
    const normalFiyatText = $(".product-price-old").first().text();
    
    // Fallback: product-price içindeki ilk rakam
    const fallback = $(".product-price").first().text();

    // Havale fiyatı - "Havale" satırındaki içerik
    let havaleFiyatText = "-";
    $(".product-list-row").each((i, el) => {
        const rowTitle = $(el).find(".product-list-title").text();
        if (/Havale/i.test(rowTitle)) {
            havaleFiyatText = $(el).find(".product-list-content").text();
        }
    });

    const normal = cleanPrice(normalFiyatText) !== "-" ? cleanPrice(normalFiyatText) : cleanPrice(fallback);
    const havale = havaleFiyatText !== "-" ? cleanPrice(havaleFiyatText) : normal;

    return {
        n: normal,
        h: havale
    };
};