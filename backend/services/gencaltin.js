const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    let havale = "-";
    let normal = "-";

    $(".text-tiny.lg\\:text-lg.font-marcellus.text-dark").each((i, el) => {
        const label = $(el).text().trim();
        const fiyat = $(el).closest("div").next("div").find(".text-tiny.lg\\:text-\\[22px\\]").first().text().trim();
        
        if (/Tek Çekim/i.test(label)) normal = cleanPrice(fiyat);
        if (/Havale/i.test(label)) havale = cleanPrice(fiyat);
    });

    return { 
        n: normal === "-" ? havale : normal,
        h: havale
    };
};