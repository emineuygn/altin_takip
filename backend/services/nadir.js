const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    let results = {
        gram: { n: "-", h: "-" },
        ceyrek: { n: "-", h: "-" },
        ajda: { n: "-", h: "-" }
    };

    // Nadir'in fiyat listesi tablosundaki satırları geziyoruz
    $("tr").each((i, el) => {
        const rowText = $(el).text();
        
        if (rowText.includes("1 gr Altın (995)")) {
            results.gram.n = cleanPrice($(el).find("td").eq(2).text()); // Alış
            results.gram.h = cleanPrice($(el).find("td").eq(3).text()); // Satış
        }
        if (rowText.includes("Yeni Çeyrek Altın")) {
            results.ceyrek.n = cleanPrice($(el).find("td").eq(2).text());
            results.ceyrek.h = cleanPrice($(el).find("td").eq(3).text());
        }
    });

    return results;
};