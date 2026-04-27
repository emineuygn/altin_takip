const cheerio = require('cheerio');

module.exports = (html, cleanPrice) => {
    const $ = cheerio.load(html);
    
    // Gönderdiğin görsellerden çıkardığım tablo yapısı:
    // Kredi Kartı fiyatı ilk <td> içinde, Havale fiyatı ikinci <td> içindedir.
    const rows = $("tbody.text-center.border tr");
    
    // Genellikle ilk satırdaki fiyatları alıyoruz (Sigortalı Kargo satırı)
    const firstRow = rows.first();
    
    const kartFiyati = firstRow.find("td").eq(0).text();   // K.KARTI sütunu
    const havaleFiyati = firstRow.find("td").eq(1).text(); // Havale/EFT sütunu

    return {
        n: cleanPrice(havaleFiyati), // Nakit (Havale)
        h: cleanPrice(kartFiyati)    // Kart (Kredi Kartı)
    };
};