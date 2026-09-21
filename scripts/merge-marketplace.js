// GitHub Actions tarafından günde 3 kez çalıştırılır: backend'in ayrı ayrı
// döndürdüğü gram/çeyrek/ajda sonuçlarını tek bir data/marketplace.json'a
// birleştirir. Pazar Yeri geçmiş tutmuyor, her seferinde üzerine yazılır.
const fs = require('fs');
const path = require('path');

const [gramPath, ceyrekPath, ajdaPath] = process.argv.slice(2);
if (!gramPath || !ceyrekPath || !ajdaPath) {
    console.error('Kullanım: node merge-marketplace.js <gram.json> <ceyrek.json> <ajda.json>');
    process.exit(1);
}

const readResults = (p) => {
    try {
        const json = JSON.parse(fs.readFileSync(p, 'utf8'));
        return json.results || {};
    } catch (e) {
        console.error('Okunamadı:', p, e.message);
        return {};
    }
};

const gram = readResults(gramPath);
const ceyrek = readResults(ceyrekPath);
const ajda = readResults(ajdaPath);

const names = new Set([...Object.keys(gram), ...Object.keys(ceyrek), ...Object.keys(ajda)]);

const stores = Array.from(names).map((name) => ({
    name,
    gram: gram[name] || null,
    ceyrek: ceyrek[name] || null,
    ajda: ajda[name] || null,
}));

const output = { timestamp: new Date().toISOString(), stores };

const outPath = path.join(__dirname, '..', 'data', 'marketplace.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`marketplace.json güncellendi (${stores.length} firma).`);
