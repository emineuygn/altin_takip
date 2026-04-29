const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    const prices = $('p.text-\\[18px\\]');
    const normal = cleanPrice(prices.eq(0).text());
    const havale = cleanPrice(prices.eq(1).text());

    return {
        n: normal,
        h: havale
    };
};