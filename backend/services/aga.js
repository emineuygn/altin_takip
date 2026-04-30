const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    const kartText = $(".last-price").first().text().trim();

    const parse = (str) => {
        if (!str || str === '-') return "-";
        const m = str.replace(/\s/g, '').match(/[\d.]+,\d{2}/);
        if (!m) return "-";
        return parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
    };

    const fiyat = parse(kartText);

    return {
        n: fiyat,
        h: fiyat
    };
};