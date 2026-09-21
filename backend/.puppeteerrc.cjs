const { join } = require('path');

// Render'da varsayılan Puppeteer cache klasörü (~/.cache/puppeteer) proje
// dizininin DIŞında kalıyor ve build aşamasından runtime'a taşınmıyor
// ("Could not find Chrome" hatasına yol açıyordu). Cache'i proje dizininin
// içine alarak bu sorunu çözüyoruz.
module.exports = {
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
