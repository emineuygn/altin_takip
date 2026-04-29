const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    return {
        n: cleanPrice($("#salePrice").first().text()),
        h: cleanPrice($("#transferPrice").first().text())
    };
};