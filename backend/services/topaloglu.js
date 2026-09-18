const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // Site yenilendi: tek liste fiyatı var (kredi kartı/havale ayrımı JS ile
    // sonradan yükleniyor, statik HTML'de bulunmuyor), o yüzden n ve h aynı.
    const fiyat = cleanPrice($('[data-toggle="price-sell-vat"]').first().text());

    return { n: fiyat, h: fiyat };
};
