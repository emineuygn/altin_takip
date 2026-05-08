const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    const normalFiyatText = $(".product-price-old").first().text();
    
    let havaleFiyatText = "-";
    $(".product-list-row").each((i, el) => {
        const rowTitle = $(el).find(".product-list-title").text();
        if (/Havale/i.test(rowTitle)) {
            havaleFiyatText = $(el).find(".product-list-content").text();
        }
    });

    const normal = cleanPrice(normalFiyatText);
    const havale = havaleFiyatText !== "-" ? cleanPrice(havaleFiyatText) : normal;

    return { n: normal, h: havale };
};