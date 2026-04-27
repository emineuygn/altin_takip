const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    // Rima'da fiyatlar genellikle "woocommerce-Price-amount" içinde olur
    // summary price içindeki ilk miktar nakit, varsa indirimli olanı yakalarız
    let priceText = $(".summary .price").first().text();
    
    // Eğer summary boşsa tüm sayfada ilk gördüğün fiyatı almayı dene
    if (!priceText) {
        priceText = $(".woocommerce-Price-amount").first().text();
    }

    const cleaned = cleanPrice(priceText);

    return {
        n: cleaned,
        h: cleaned // Rima genelde tek fiyat gösterdiği için ikisine de aynı şeyi yazdık
    };
};