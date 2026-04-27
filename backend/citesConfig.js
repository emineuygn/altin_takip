// backend/sitesConfig.js

const STORES = [
    { 
        name: "Altın Anne", 
        urls: { 
            gram: "https://altinanne.com/urun/1-gr-24-ayar-ard-gram-altin-1-g-adr-995", 
            ceyrek: "https://altinanne.com/urun/ceyrek-altin-darphane-eski-tarihli-e-t-s-cyrk", 
            ajda: "https://altinanne.com/urun/duz-sade-ajda-bilezik-22-ayar-15-gr-15-g-ajd" 
        },
        s_n: ".price-amount.md\\:text-2xl.text-secondary",
        s_h: ".price-amount.md\\:text-3xl"
    },
    { 
        name: "Nadir Gold", 
        urls: { 
        gram: "https://www.nadirgold.com/nadirgold-1-gr-kulce-altin", 
        ceyrek: "https://www.nadirgold.com/ceyrek-altin", 
        ajda: null
        },
        s_n: "#product-price-new", 
        s_h: "#product-price-old"
    },
    { 
        name: "Ahlatcı Store", 
        urls: { 
            gram: "https://www.ahlatcistore.com.tr/urun/24-ayar-1g-altin", 
            ceyrek: "https://www.ahlatcistore.com.tr/urun/sarrafiye-ceyrek-altin-yeni-tarihli", 
            ajda: "https://www.ahlatcistore.com.tr/urun/15-gr-22-ayar-oluklu-ajda-bilezik" 
        },
        s_n: ".product-price .discounted",
        s_h: ".product-price .original"
    },
    { 
        name: "Gencay Gold", 
        urls: { 
            gram: "https://gencaygold.com/urun/1-gr-24-ayar-gencay-gram-altin/", 
            ceyrek: "https://gencaygold.com/urun/ceyrek-altin-darphane-eski-tarihli/", 
            ajda: "https://gencaygold.com/urun/oluklu-ajda-bilezik-22-ayar-15-gram/" 
        },
        s_n: "#credit-card-price .woocommerce-Price-amount", 
        s_h: "#eft-price .woocommerce-Price-amount"
    },
    { 
        name: "Genç Altın", 
        urls: { 
            gram: "https://gencaltin.com/1-gram-24-ayar-kulce-altin", 
            ceyrek: "https://www.gencaltin.com/ziynet-ceyrek-altin-yeni-tarihli", 
            ajda: "https://www.gencaltin.com/15-gr-22-ayar-ajda-bilezik" 
        },
        type: "text" // Metin bazlı tarama yapacak
    },
    { 
        name: "Gramal", 
        urls: { 
            gram: "https://www.gramal.com.tr/1-gr-24-ayar-kulce-altin-995-0-isgold", // Daha spesifik bir ürün linki
            ceyrek: null, 
            ajda: null
        },
        s_n: "#salePrice", 
        s_h: "#transferPrice"
    },
    { 
        name: "AGA Külçe", 
        urls: { 
            gram: "https://www.agakulche.com/agakulche-1-gr-995-24-ayar-amr-kulce-altin", 
            ceyrek: null, 
            ajda: null 
        },
        s_n: ".product-detail-content-boxes .first-line .price", 
        s_h: "strong.last-price"
    },
    { 
        name: "Rima Gold", 
        urls: { 
            gram: "https://rimagold.com.tr/urun/1-gr-24-ayar-gmr-gram-altin/", 
            ceyrek: "https://rimagold.com.tr/urunler/ceyrek-altin-yeni-tarihli-2024", // Yılı 2024 olarak revize ettik (404 önlemek için)
            ajda: "https://rimagold.com.tr/urunler/22-ayar-15-gram-ajda-bilezik" 
        },
        type: "table" // Tablo bazlı tarama yapacak
    },
    { 
        name: "Topaloğlu Altın", 
        urls: { 
            gram: "https://www.etopaloglualtin.com/urun/24-ayar-1-gr-kulce-altin-995-0", 
            ceyrek: "https://www.etopaloglualtin.com/urun/ceyrek-altin-yeni-tarihli",
            ajda: null 
        },
        s_n: ".product-price-new", 
        s_h: ".product-list-row:contains('Havale') .product-list-content"
    },
    { 
        name: "Samsun Altın Rafineri", 
        urls: { 
            gram: "https://samsunaltinrafineri.com/1-gr-24-ayar-sar-gram-altin-1-gr-sar-995", 
            ceyrek: "https://samsunaltinrafineri.com/ceyrek-altin-darphane-yeni-tarihli-y-t-s-cyrk-s", 
            ajda: null 
        },
        s_n: ".price-amount", 
        s_h: ".product-list-row:contains('Havale') .product-list-content"
    },
    { 
        name: "Altın Dükkanı", 
        urls: { 
            gram: "https://www.altindukkani.com.tr/isgold-1-gram-altin-24-ayar-0995-kulce-altin", 
            ceyrek: null, 
            ajda: null 
        },
        s_n: ".product-price", 
        s_h: null 
    },
    { 
        name: "Etopaloglu Altın", 
        urls: { 
            gram: "https://www.etopaloglualtin.com/urun/24-ayar-1-gr-kulce-altin-995-0", 
            ceyrek: "https://www.etopaloglualtin.com/urun/ceyrek-altin", 
            ajda: null 
        },
        s_n: ".showcase-price-new", 
        s_h: ".showcase-price-new"
    }
];

module.exports = { STORES };