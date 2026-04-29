const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    const rows = $('tbody.text-center tr');
    let normal = "-";
    let havale = "-";

    rows.each((i, el) => {
        const tds = $(el).find('td');
        if (tds.length >= 2) {
            const n = cleanPrice(tds.eq(1).text());
            const h = cleanPrice(tds.eq(2).text());
            if (i === 0) { normal = n; havale = h; }
        }
    });

    return { n: normal, h: havale };
};