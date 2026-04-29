const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    const normal = cleanPrice($('.price-amount').first().text());
    const havale = cleanPrice($('.bg-secondary span').first().text());

    return {
        n: normal,
        h: havale === "-" ? normal : havale
    };
};