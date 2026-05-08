const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
const agent = new https.Agent({ rejectUnauthorized: false });

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

// Ortak Scrape Fonksiyonu
const scrapeTriple = async (res, storeName, urls, parserKey) => {
    try {
        const fetchUrl = async (url) => {
            if (!url) return null;
            try {
                const response = await axios.get(url, { headers: HEADERS, httpsAgent: agent, timeout: 5000 });
                return response.data;
            } catch (e) { return null; }
        };

        const [gData, cData, aData] = await Promise.all([
            fetchUrl(urls.g),
            fetchUrl(urls.c),
            fetchUrl(urls.a)
        ]);

        const parser = parsers[parserKey];
        res.json({
            name: storeName,
            gram: gData ? parser(gData, cleanPrice) : { n: "-", h: "-" },
            ceyrek: cData ? parser(cData, cleanPrice) : { n: "-", h: "-" },
            ajda: aData ? parser(aData, cleanPrice) : { n: "-", h: "-" },
            status: "online"
        });
    } catch (error) {
        res.json({ name: storeName, status: "offline" });
    }
};

// --- ENDPOINTS ---

app.get('/api/altinanne', async (req, res) => {
    try {
        const parser = parsers['altinanne'];
        
        const gramUrls = [
            "https://altinanne.com/urun/1-gr-24-ayar-ard-gram-altin-1-g-adr-995",
            "https://altinanne.com/urun/1-gr-24-ayar-gar-gram-altin-alt-an-gar-1gr-995",
            "https://altinanne.com/urun/1-gr-24-ayar-rekor-gram-altin-1-g-rkr-995-alt",
            "https://altinanne.com/urun/24-ayar-995-milyem-nadir-gold-1-gram-altin-1-gr-ndr-995-a",
            "https://altinanne.com/urun/1-gr-24-ayar-iar-gram-altin-1-g-iar-995"
        ];

        const fetchUrl = async (url) => {
            try {
                const response = await axios.get(url, { headers: HEADERS, httpsAgent: agent, timeout: 5000 });
                return response.data;
            } catch(e) { return null; }
        };

        // Tüm gram URL'lerini çek, en düşük fiyatlıyı bul
        const gramResults = await Promise.all(gramUrls.map(async (url) => {
            const html = await fetchUrl(url);
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

        // Çeyrek ve ajda tek URL'den
        const [cData, aData] = await Promise.all([
            fetchUrl("https://altinanne.com/urun/ceyrek-altin-darphane-eski-tarihli-e-t-s-cyrk"),
            fetchUrl("https://altinanne.com/urun/duz-sade-ajda-bilezik-22-ayar-15-gr-15-g-ajd")
        ]);

        res.json({
            name: "Altın Anne",
            gram: bestGram,
            ceyrek: cData ? parser(cData, cleanPrice) : { n: "-", h: "-" },
            ajda: aData ? parser(aData, cleanPrice) : { n: "-", h: "-" },
            status: "online"
        });
    } catch(e) {
        res.json({ name: "Altın Anne", status: "offline" });
    }
});
// Nadir Gold için doğrudan fiyat servisinden veri çekiyoruz (HTML parse etmekle uğraşmıyoruz
app.get('/api/nadir', async (req, res) => {
    try {
        const parser = require('./services/nadir');
        const prices = await parser();
        res.json({ name: "Nadir Gold", ...prices, status: "online" });
    } catch (e) {
        res.json({ name: "Nadir Gold", status: "offline" });
    }
});
app.get('/api/aga', async (req, res) => {
    try {
        const urls = {
            g: "https://www.agakulche.com/agakulche-1-gr-995-24-ayar-amr-kulce-altin",
            c: "https://www.agakulche.com/ziynet-ceyrek-altin-yeni-2024-kulplu",
            a: "https://www.agakulche.com/15-gr-22-ayar-ajda-bilezik"
        };

        const fetchPrice = async (url) => {
            if (!url) return { n: "-", h: "-" };
            try {
                const { data } = await axios.get(url, { headers: HEADERS, httpsAgent: agent, timeout: 5000 });
                const cheerio = require('cheerio');
                const $ = cheerio.load(data);
                const raw = $('.last-price').first().text().replace(/\s/g, '');
                const m = raw.match(/[\d.]+,\d{2}/);
                if (!m) return { n: "-", h: "-" };
                const fiyat = parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
                return { n: fiyat, h: fiyat };
            } catch(e) {
                return { n: "-", h: "-" };
            }
        };

        const [gram, ceyrek, ajda] = await Promise.all([
            fetchPrice(urls.g),
            fetchPrice(urls.c),
            fetchPrice(urls.a)
        ]);

        res.json({ name: "Aga Külçe", gram, ceyrek, ajda, status: "online" });
    } catch(e) {
        res.json({ name: "Aga Külçe", status: "offline" });
    }
});


app.get('/api/topaloglu', async (req, res) => {
    try {
        const parser = parsers['topaloglu'];
        
        const customHeaders = {
            ...HEADERS,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Referer': 'https://www.google.com/',
        };

        const fetchUrl = async (url) => {
            if (!url) return null;
            try {
                const response = await axios.get(url, { headers: customHeaders, httpsAgent: agent, timeout: 10000 });
                return response.data;
            } catch(e) { return null; }
        };

        const [gData, cData, aData] = await Promise.all([
            fetchUrl("https://www.etopaloglualtin.com/urun/1-gram-24-ayar-iar-gramaltin"),
            fetchUrl("https://www.etopaloglualtin.com/urun/ceyrek-altin"),
            fetchUrl("https://www.etopaloglualtin.com/urun/15-gr-22-ayar-ajda-bilezik")
        ]);

        res.json({
            name: "Topaloğlu",
            gram: gData ? parser(gData, cleanPrice) : { n: "-", h: "-" },
            ceyrek: cData ? parser(cData, cleanPrice) : { n: "-", h: "-" },
            ajda: aData ? parser(aData, cleanPrice) : { n: "-", h: "-" },
            status: "online"
        });
    } catch(e) {
        res.json({ name: "Topaloğlu", status: "offline" });
    }
});

app.get('/api/gencaltin', (req, res) => scrapeTriple(res, "Genç Altın", {
    g: "https://gencaltin.com/1-gram-24-ayar-kulce-altin",
    c: "https://gencaltin.com/ziynet-ceyrek-altin-yeni-tarihli",
    a: "https://gencaltin.com/15-gr-22-ayar-ajda-bilezik"
}, 'gencaltin'));
app.get('/api/rima', (req, res) => scrapeTriple(res, "Rima Gold", {
    g: "https://rimagold.com.tr/urunler/1-gr-24-ayar-gmr-gram-altin",
    c: "https://rimagold.com.tr/urunler/ceyrek-altin-yeni-tarihli-(2026)",
    a: "https://rimagold.com.tr/urunler/22-ayar-15-gram-yuvarlak-ajda-bilezik"
}, 'rima'));

app.get('/api/samsun', (req, res) => scrapeTriple(res, "Samsun Altın", {
    g: "https://samsunaltinrafineri.com/1-gr-24-ayar-sar-gram-altin-1-gr-sar-995",
    c: "https://samsunaltinrafineri.com/ceyrek-altin-darphane-yeni-tarihli-y-t-s-cyrk-s",
    a: null
}, 'samsun'));
// server.js içindeki endpoint
app.get('/api/gencay', (req, res) => scrapeTriple(res, "Gencay Gold", {
    g: "https://gencaygold.com/urun/1-gr-24-ayar-gencay-gram-altin/",
    c: "https://gencaygold.com/urun/ceyrek-altin-darphane-eski-tarihli/",
    a: "https://gencaygold.com/urun/oluklu-ajda-bilezik-22-ayar-15-gram/"
}, 'gencay'));

app.get('/api/gramal', (req, res) => scrapeTriple(res, "Gramal", {
    g: "https://www.gramal.com.tr/bir-gram-24-ayar-kulce-altin",
    c: "https://www.gramal.com.tr/ceyrek-altin-yeni-tarihli",
    a: "https://www.gramal.com.tr/u/243/15-gram-22-ayar-oluklu-ajda-bilezik"
}, 'gramal'));

app.get('/api/ahlatci', (req, res) => scrapeTriple(res, "Ahlatcı", {
    g: "https://www.ahlatcistore.com.tr/urun/24-ayar-1g-altin",
    c: "https://www.ahlatcistore.com.tr/urun/sarrafiye-ceyrek-altin-yeni-tarihli",
    a: "https://www.ahlatcistore.com.tr/urun/15-gr-22-ayar-oluklu-ajda-bilezik"
}, 'ahlatci'));
// parsers objesine ekle
anadolum: require('./services/anadolum'),

// endpoint ekle
app.get('/api/anadolum', async (req, res) => {
    try {
        const parser = parsers['anadolum'];
        
        const fetchUrl = async (url) => {
            if (!url) return null;
            try {
                const response = await axios.get(url, { headers: HEADERS, httpsAgent: agent, timeout: 10000 });
                return response.data;
            } catch(e) { 
                console.error('fetchUrl hata:', e.message);
                return null; 
            }
        };

        const [gData, cData] = await Promise.all([
            fetchUrl("https://anadolumaltin.com/urun/ozbag-1-gr-kulce-altin/"),
            fetchUrl("https://anadolumaltin.com/urun/1-adet-eski-tarihli-ceyrek-altin/")
        ]);

        console.log('gData geldi mi:', !!gData, 'cData geldi mi:', !!cData);

        res.json({
            name: "Anadolum Altın",
            gram: gData ? parser(gData, cleanPrice) : { n: "-", h: "-" },
            ceyrek: cData ? parser(cData, cleanPrice) : { n: "-", h: "-" },
            ajda: { n: "-", h: "-" },
            status: "online"
        });
    } catch(e) {
        console.error('anadolum hata:', e.message);
        res.json({ name: "Anadolum Altın", status: "offline" });
    }
});

// Diğer firmalar (Şu anlık sadece gram linkleri var, onları da tekli scrape edebiliriz)
const singleScrape = (slug, name, url) => {
    app.get(`/api/${slug}`, async (req, res) => {
        try {
            const { data } = await axios.get(url, { headers: HEADERS, httpsAgent: agent });
            const prices = parsers[slug](data, cleanPrice);
            res.json({ name, gram: prices, ceyrek: {n:"-",h:"-"}, ajda: {n:"-",h:"-"}, status: "online" });
        } catch (e) { res.json({ name, status: "offline" }); }
    });
};


singleScrape('altindukkani', 'Altın Dükkanı', 'https://www.altindukkani.com.tr/isgold-1-gram-altin-24-ayar-0995-kulce-altin');

app.listen(4000, () => console.log("🚀 Server 4000 portunda hazır!"));