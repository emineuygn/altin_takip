const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    // Ahlatcı genellikle bu classları kullanır
    const nakitText = $(".product-price .discounted").text();
    const kartText = $(".product-price .original").text();

    return {
        n: cleanPrice(nakitText),
        h: cleanPrice(kartText)
    };
};