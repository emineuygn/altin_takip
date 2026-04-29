const cheerio = require('cheerio');
module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    const rows = $('tbody.text-center tr');
    let normal = "-";
    let havale = "-";

    rows.each((i, el) => {
        const tds = $(el).find('td');
        if (tds.length >= 2 && i === 0) {
            const n = cleanPrice(tds.eq(0).text());

            // td[1] raw HTML'den sadece <br>'dan önceki ilk fiyatı regex ile çek
            const rawHtml = tds.eq(1).html() || "";
            const beforeBr = rawHtml.split('<br>')[0]; // <br>'dan öncesi
            const h = cleanPrice(beforeBr);

            normal = n;
            havale = h;
        }
    });
    return { n: normal, h: havale };
};