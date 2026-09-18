// nadirgold.com Next.js App Router kullanıyor; fiyat düz HTML'de/CSS selector'la
// bulunmuyor. Ama sayfanın React Server Components stream'i (self.__next_f.push(...))
// içinde ürün verisi escape'lenmiş JSON olarak gömülü geliyor. "bankTransferPrice"
// alanı her ürün sayfasında tam bir kez geçiyor ve ana ürüne ait "prices" nesnesinin
// içinde olduğu için, slug bilmeye gerek kalmadan güvenilir bir çapa noktası.
module.exports = (html, cleanPrice) => {
    if (typeof html !== 'string') return { n: "-", h: "-" };

    const anchor = html.indexOf('bankTransferPrice');
    if (anchor === -1) return { n: "-", h: "-" };

    const start = Math.max(0, anchor - 800);
    const chunk = html.slice(start, anchor + 200).replace(/\\/g, '');

    const priceMatches = [...chunk.matchAll(/"price":([\d.]+)/g)];
    const bankMatch = chunk.match(/"bankTransferPrice":([\d.]+)/);

    const n = priceMatches.length ? parseFloat(priceMatches[priceMatches.length - 1][1]) : NaN;
    const h = bankMatch ? parseFloat(bankMatch[1]) : NaN;

    return {
        n: isNaN(n) ? "-" : n,
        h: isNaN(h) ? "-" : h
    };
};
