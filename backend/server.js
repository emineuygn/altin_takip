const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
const agent = new https.Agent({ rejectUnauthorized: false });

// Bazı siteler (altinanne, gramal, rima) Render'ın IP'sini bot koruması (403) ile
// engelliyor. SCRAPER_API_KEY tanımlıysa bu sitelerin istekleri ScraperAPI proxy'si
// üzerinden atılır; tanımlı değilse doğrudan gidilir (yerelde çalışırken olduğu gibi).
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const viaProxy = (url) => SCRAPER_API_KEY
    ? `http://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`
    : url;

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
};

const cleanPrice = (text) => {
    if (!text || typeof text !== 'string') return "-";
    const trimmed = text.trim();
    // Türkçe format kontrolü: son 3 karakter virgül+2 rakam mı?
    const trMatch = trimmed.match(/^[\d.]+,\d{2}$/);
    if (trMatch) {
        const price = parseFloat(trimmed.replace(/\./g, '').replace(',', '.'));
        return isNaN(price) ? "-" : price;
    }
    // Normal format
    const cleaned = trimmed.replace(/[^\d.,]/g, '');
    const price = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    return isNaN(price) ? "-" : price;
};

// Parser'lar (Services içindeki dosyaların isimleriyle birebir aynı olmalı)
const parsers = {
    altinanne: require('./services/altinanne'),
    topaloglu: require('./services/topaloglu'),
    gencaltin: require('./services/gencaltin'),
    nadir: require('./services/nadir'),
    ahlatci: require('./services/ahlatci'),
    gramal: require('./services/gramal'),
    rima: require('./services/rima'),
    altindukkani: require('./services/altindukkani'),
    gencay: require('./services/gencay'),
    samsun: require('./services/samsun'),
    anadolum: require('./services/anadolum')
};

// ScraperAPI'nin ücretsiz planı eşzamanlı istek sayısını sınırlıyor; /api/all
// çalışırken altinanne/gramal/rima birden 13 proxy isteği aynı anda ateşleyince
// bir kısmı başarısız oluyordu. Günde 3 kez çalıştığımız için hız kritik değil,
// proxy isteklerini kuyruğa alıp aynı anda en fazla 2 tanesini çalıştırıyoruz.
const MAX_CONCURRENT_PROXY = 2;
let activeProxyRequests = 0;
const proxyQueue = [];
const runWithProxyLimit = (fn) => new Promise((resolve) => {
    const run = async () => {
        activeProxyRequests++;
        try {
            resolve(await fn());
        } finally {
            activeProxyRequests--;
            const next = proxyQueue.shift();
            if (next) next();
        }
    };
    if (activeProxyRequests < MAX_CONCURRENT_PROXY) run();
    else proxyQueue.push(run);
});

// Tek bir URL çekip HTML döndürür (başarısız olursa null). opts.proxy: true ise
// ScraperAPI üzerinden gider (kuyruklu).
const fetchHtml = async (url, opts = {}) => {
    if (!url) return null;
    const doFetch = async () => {
        try {
            const target = opts.proxy ? viaProxy(url) : url;
            const response = await axios.get(target, {
                headers: opts.headers || HEADERS,
                httpsAgent: agent,
                timeout: opts.timeout || 5000
            });
            return response.data;
        } catch (e) { return null; }
    };
    return opts.proxy ? runWithProxyLimit(doFetch) : doFetch();
};

// Gram/çeyrek/ajda linki olan standart firmalar için ortak veri çekici.
// res.json çağırmaz, veriyi döndürür (hem tekli route hem /api/all bunu kullanır).
const fetchTriple = async (storeName, urls, parserKey, opts = {}) => {
    try {
        const [gData, cData, aData] = await Promise.all([
            fetchHtml(urls.g, opts),
            fetchHtml(urls.c, opts),
            fetchHtml(urls.a, opts)
        ]);
        const parser = parsers[parserKey];
        return {
            name: storeName,
            gram: gData ? parser(gData, cleanPrice) : { n: "-", h: "-" },
            ceyrek: cData ? parser(cData, cleanPrice) : { n: "-", h: "-" },
            ajda: aData ? parser(aData, cleanPrice) : { n: "-", h: "-" },
            status: "online"
        };
    } catch (error) {
        return { name: storeName, status: "offline" };
    }
};

// --- Firma bazlı veri çekiciler ---

const getAltinanne = async () => {
    try {
        const parser = parsers['altinanne'];

        // Aynı ürünün birden fazla varyasyonu var, en düşük fiyatlıyı referans alıyoruz.
        const gramUrls = [
            "https://altinanne.com/urun/1-gr-24-ayar-ard-gram-altin-1-g-adr-995",
            "https://altinanne.com/urun/1-gr-24-ayar-gar-gram-altin-alt-an-gar-1gr-995",
            "https://altinanne.com/urun/1-gr-24-ayar-rekor-gram-altin-1-g-rkr-995-alt",
            "https://altinanne.com/urun/24-ayar-995-milyem-nadir-gold-1-gram-altin-1-gr-ndr-995-a",
            "https://altinanne.com/urun/1-gr-24-ayar-iar-gram-altin-1-g-iar-995"
        ];

        const gramResults = await Promise.all(gramUrls.map(async (url) => {
            const html = await fetchHtml(url, { proxy: true, timeout: 25000 });
            if (!html) return null;
            return parser(html, cleanPrice);
        }));

        let bestGram = { n: "-", h: "-" };
        let lowestPrice = Infinity;
        gramResults.forEach(result => {
            if (!result) return;
            const price = typeof result.h === 'number' ? result.h : (typeof result.n === 'number' ? result.n : Infinity);
            if (price > 0 && price < lowestPrice) {
                lowestPrice = price;
                bestGram = result;
            }
        });

        const [cData, aData] = await Promise.all([
            fetchHtml("https://altinanne.com/urun/ceyrek-altin-darphane-eski-tarihli-e-t-s-cyrk", { proxy: true, timeout: 25000 }),
            fetchHtml("https://altinanne.com/urun/duz-sade-ajda-bilezik-22-ayar-15-gr-15-g-ajd", { proxy: true, timeout: 25000 })
        ]);

        return {
            name: "Altın Anne",
            gram: bestGram,
            ceyrek: cData ? parser(cData, cleanPrice) : { n: "-", h: "-" },
            ajda: aData ? parser(aData, cleanPrice) : { n: "-", h: "-" },
            status: "online"
        };
    } catch (e) {
        return { name: "Altın Anne", status: "offline" };
    }
};

// nadirgold.com fiyatları JS ile sonradan yüklüyor (statik HTML'de bulunmuyor),
// bu yüzden şu an gerçek veri çekemiyoruz. Eskiden buradaki kod tanımsız bir
// Puppeteer `browser` değişkenine referans verip her seferinde patlıyordu;
// Render'ın ücretsiz planında Puppeteer/Chromium çalıştırmak riskli olduğu için
// onu geri getirmek yerine site düz HTML'e dönerse çalışacak şekilde bırakıyoruz.
const getNadir = async () => {
    try {
        const parser = parsers['nadir'];
        const [gHtml, cHtml] = await Promise.all([
            fetchHtml("https://www.nadirgold.com/1-gram-altin-kulce-altin", { timeout: 10000 }),
            fetchHtml("https://www.nadirgold.com/ceyrek-altin", { timeout: 10000 })
        ]);
        if (!gHtml) return { name: "Nadir Gold", status: "offline" };
        return {
            name: "Nadir Gold",
            gram: parser(gHtml, cleanPrice),
            ceyrek: cHtml ? parser(cHtml, cleanPrice) : { n: "-", h: "-" },
            ajda: { n: "-", h: "-" }, // sitede 15 gr ajda bilezik yok
            status: "online"
        };
    } catch (e) {
        return { name: "Nadir Gold", status: "offline" };
    }
};

const getAga = async () => {
    try {
        const urls = {
            g: "https://www.agakulche.com/agakulche-1-gr-995-24-ayar-amr-kulce-altin",
            c: "https://www.agakulche.com/ziynet-ceyrek-altin-yeni-2024-kulplu"
            // 15 gr ajda bilezik artık sitede satışta değil (link 404), o yüzden ajda çekmiyoruz.
        };

        const parsePrice = (html) => {
            if (!html) return { n: "-", h: "-" };
            const $ = cheerio.load(html);
            const raw = $('.last-price').first().text().replace(/\s/g, '');
            const m = raw.match(/[\d.]+,\d{2}/);
            if (!m) return { n: "-", h: "-" };
            const fiyat = parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
            return { n: fiyat, h: fiyat };
        };

        const [gHtml, cHtml] = await Promise.all([fetchHtml(urls.g), fetchHtml(urls.c)]);

        return {
            name: "Aga Külçe",
            gram: parsePrice(gHtml),
            ceyrek: parsePrice(cHtml),
            ajda: { n: "-", h: "-" },
            status: "online"
        };
    } catch (e) {
        return { name: "Aga Külçe", status: "offline" };
    }
};

const getTopaloglu = async () => {
    try {
        const parser = parsers['topaloglu'];
        const customHeaders = {
            ...HEADERS,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Referer': 'https://www.google.com/',
        };

        // Eski ürün linkleri 404 veriyordu (site kataloğu değişmiş), güncel linklerle değiştirildi.
        const [gData, cData] = await Promise.all([
            fetchHtml("https://etopaloglualtin.com/1-gram-24-ayar-995-kulce-altin", { headers: customHeaders, timeout: 10000 }),
            fetchHtml("https://etopaloglualtin.com/eski-ceyrek", { headers: customHeaders, timeout: 10000 })
        ]);

        return {
            name: "Topaloğlu",
            gram: gData ? parser(gData, cleanPrice) : { n: "-", h: "-" },
            ceyrek: cData ? parser(cData, cleanPrice) : { n: "-", h: "-" },
            ajda: { n: "-", h: "-" }, // sitede 15 gr ajda bilezik bulunamadı
            status: "online"
        };
    } catch (e) {
        return { name: "Topaloğlu", status: "offline" };
    }
};

// anadolumaltin.com: eski ürün linkleri 404 veriyor. Gerçek bir tarayıcıyla
// (Puppeteer, çerez onayı kabul edilmiş, bot-tespiti atlatma denenmiş) kategori,
// arama ve tekil ürün sayfalarının hepsi "ürün bulunamadı" döndü — sitenin kendi
// tarafında bir sorun ya da bizim atlatamadığımız bir koruma var. Veri çekemiyoruz.
const getAnadolum = async () => {
    try {
        const parser = parsers['anadolum'];
        const [gData, cData] = await Promise.all([
            fetchHtml("https://anadolumaltin.com/urun/ozbag-1-gr-kulce-altin/", { timeout: 10000 }),
            fetchHtml("https://anadolumaltin.com/urun/1-adet-eski-tarihli-ceyrek-altin/", { timeout: 10000 })
        ]);

        return {
            name: "Anadolum Altın",
            gram: gData ? parser(gData, cleanPrice) : { n: "-", h: "-" },
            ceyrek: cData ? parser(cData, cleanPrice) : { n: "-", h: "-" },
            ajda: { n: "-", h: "-" },
            status: "online"
        };
    } catch (e) {
        return { name: "Anadolum Altın", status: "offline" };
    }
};

// altindukkani.com.tr 1 gr külçe satmıyor (en küçüğü 5 gr), önceki 1 gr linki bu
// yüzden 404 veriyordu ("ürün bulunamadı" kategorisiydi). 5 gr ürününü çekip
// 5'e bölerek diğer firmalarla karşılaştırılabilir "1 gram eşdeğeri" üretiyoruz.
const getAltindukkani = async () => {
    try {
        const html = await fetchHtml("https://altindukkani.com.tr/5-gr-altin-kulce", { timeout: 10000 });
        if (!html) return { name: "Altın Dükkanı", status: "offline" };
        const per5gr = parsers['altindukkani'](html, cleanPrice);
        const divide = (v) => typeof v === 'number' ? Math.round((v / 5) * 100) / 100 : "-";
        return {
            name: "Altın Dükkanı",
            gram: { n: divide(per5gr.n), h: divide(per5gr.h) },
            ceyrek: { n: "-", h: "-" },
            ajda: { n: "-", h: "-" },
            status: "online"
        };
    } catch (e) {
        return { name: "Altın Dükkanı", status: "offline" };
    }
};

// --- Tüm firmalar tek yerde: hem tekli route'lar hem /api/all bunu kullanır ---
const STORE_FETCHERS = {
    altinanne: getAltinanne,
    nadir: getNadir,
    aga: getAga,
    topaloglu: getTopaloglu,
    gencaltin: () => fetchTriple("Genç Altın", {
        g: "https://gencaltin.com/1-gram-24-ayar-kulce-altin",
        c: "https://gencaltin.com/ziynet-ceyrek-altin-yeni-tarihli",
        a: "https://gencaltin.com/15-gr-22-ayar-ajda-bilezik"
    }, 'gencaltin'),
    rima: () => fetchTriple("Rima Gold", {
        g: "https://rimagold.com.tr/urunler/1-gr-24-ayar-gmr-gram-altin",
        c: "https://rimagold.com.tr/urunler/ceyrek-altin-yeni-tarihli-(2026)",
        a: "https://rimagold.com.tr/urunler/22-ayar-15-gram-yuvarlak-ajda-bilezik"
    }, 'rima', { proxy: true, timeout: 25000 }),
    samsun: () => fetchTriple("Samsun Altın", {
        g: "https://samsunaltinrafineri.com/1-gr-24-ayar-sar-gram-altin-1-gr-sar-995",
        c: "https://samsunaltinrafineri.com/ceyrek-altin-darphane-yeni-tarihli-y-t-s-cyrk-s",
        a: null // sitede 15 gr ajda bilezik satılmıyor
    }, 'samsun'),
    gencay: () => fetchTriple("Gencay Gold", {
        g: "https://gencaygold.com/urun/1-gr-24-ayar-gencay-gram-altin/",
        c: "https://gencaygold.com/urun/ceyrek-altin-darphane-eski-tarihli/",
        a: "https://gencaygold.com/urun/oluklu-ajda-bilezik-22-ayar-15-gram/"
    }, 'gencay'),
    gramal: () => fetchTriple("Gramal", {
        g: "https://www.gramal.com.tr/bir-gram-24-ayar-kulce-altin",
        c: "https://www.gramal.com.tr/ceyrek-altin-yeni-tarihli",
        a: "https://www.gramal.com.tr/u/243/15-gram-22-ayar-oluklu-ajda-bilezik"
    }, 'gramal', { proxy: true, timeout: 25000 }),
    ahlatci: () => fetchTriple("Ahlatcı", {
        g: "https://www.ahlatcistore.com.tr/urun/24-ayar-1g-altin",
        c: "https://www.ahlatcistore.com.tr/urun/sarrafiye-ceyrek-altin-yeni-tarihli",
        a: "https://www.ahlatcistore.com.tr/urun/15-gr-22-ayar-oluklu-ajda-bilezik"
    }, 'ahlatci'),
    anadolum: getAnadolum,
    altindukkani: getAltindukkani
};

// --- ENDPOINTS ---

Object.entries(STORE_FETCHERS).forEach(([slug, fetcher]) => {
    app.get(`/api/${slug}`, async (req, res) => {
        res.json(await fetcher());
    });
});

// Tüm firmaları tek seferde döndürür. GitHub Actions günde 3 kez bunu çağırıp
// data/history.json'a kaydediyor; frontend artık tekli endpoint'lere istek atmıyor.
app.get('/api/all', async (req, res) => {
    const stores = await Promise.all(Object.values(STORE_FETCHERS).map(fn => fn()));
    res.json({ timestamp: new Date().toISOString(), stores });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda hazır!`));
