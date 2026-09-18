// GitHub Actions tarafından günde 3 kez çalıştırılır: backend'den gelen anlık
// fiyat snapshot'ını data/history.json'a ekler, dosyayı belirli bir uzunlukta tutar.
const fs = require('fs');
const path = require('path');

const MAX_ENTRIES = 90; // günde 3 kayıt x 30 gün

const snapshotPath = process.argv[2];
if (!snapshotPath) {
    console.error('Kullanım: node append-history.js <snapshot.json>');
    process.exit(1);
}

const historyPath = path.join(__dirname, '..', 'data', 'history.json');

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
if (!snapshot.timestamp || !Array.isArray(snapshot.stores)) {
    console.error('Snapshot beklenen formatta değil:', JSON.stringify(snapshot).slice(0, 200));
    process.exit(1);
}

let history = [];
if (fs.existsSync(historyPath)) {
    try {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        if (!Array.isArray(history)) history = [];
    } catch (e) {
        history = [];
    }
}

history.push(snapshot);
if (history.length > MAX_ENTRIES) {
    history = history.slice(history.length - MAX_ENTRIES);
}

fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + '\n');
console.log(`history.json güncellendi (${history.length} kayıt).`);
