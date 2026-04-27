const cheerio = require('cheerio');

/**
 * Altın Anne Özel Parser
 * @param {string} html - Siteden çekilen ham HTML
 * @param {function} cleanPrice - Fiyat temizleme fonksiyonu
 * @returns {object} { n: Nakit/Havale, h: Kart/Tek Çekim }
 */
module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);

    // Altın Anne'nin çalışan güncel selectorları
    const s_n = ".price-amount.md\\:text-2xl.text-secondary";
    const s_h = ".price-amount.md\\:text-3xl";

    let n = cleanPrice($(s_n).first().text());
    let h = cleanPrice($(s_h).first().text());

    // Eğer selector'lar boş dönerse (Fallback)
    if (n === "-" || n === null) {
        const bodyPrices = $("body").text().match(/\d{1,3}(\.\d{3})*(,\d{2})/g);
        if (bodyPrices) n = cleanPrice(bodyPrices[0]);
    }

    return { n: h, h: n }; // h büyük fiyat → normal, n küçük → havale
};