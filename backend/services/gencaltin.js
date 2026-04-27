const cheerio = require('cheerio');

/**
 * Genç Altın Özel Parser
 * Analiz: Sitede fiyatlar yan yana bloklar halinde. 
 * Havale/EFT başlığının hemen altındaki div fiyatı içeriyor.
 */
module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    let n = "-"; // Havale/EFT
    let h = "-"; // Tek Çekim (Normal)

    // Fiyat bloklarını tarıyoruz
    $("div").each((i, el) => {
        const text = $(el).text().trim();
        
        // Havale/EFT başlığını yakaladığımızda bir sonraki div'deki rakamı al
        if (/Havale\/EFT/i.test(text)) {
            const priceVal = $(el).next("div").text();
            if (priceVal) n = cleanPrice(priceVal);
        }
        
        // Tek Çekim Fiyatı başlığını yakaladığımızda bir sonraki div'deki rakamı al
        if (/Tek Çekim Fiyatı/i.test(text)) {
            const priceVal = $(el).next("div").text();
            if (priceVal) h = cleanPrice(priceVal);
        }
    });

    // Fallback: Eğer yukarıdaki yapı yakalayamazsa (class bazlı deneme)
    if (n === "-") {
        const havaleBlock = $("div:contains('Havale/EFT')").last().next("div");
        n = cleanPrice(havaleBlock.text());
    }

    return {
        n: n,
        h: h,
        a: "-" // Ajda linki gelirse burası dolacak, şu an çizgi.
    };
};