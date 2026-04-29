const getPrice = async (url) => {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    
    // Fiyat elementinin gelmesini bekle
    try {
        await page.waitForSelector('.product-price-box', { timeout: 10000 });
    } catch(e) {}
    
    const prices = await page.evaluate(() => {
    // Tüm text içeriğini döndür
    const allText = document.body.innerText;
    const priceMatches = allText.match(/[\d]{1,3}(?:\.[\d]{3})*,[\d]{2}/g);
    return { 
        raw: priceMatches ? priceMatches.slice(0, 5) : [],
        boxes: document.querySelectorAll('.product-price-box').length,
        tobias: document.querySelectorAll('.font-tobias').length
    };
});
console.log('NADIR DEBUG:', JSON.stringify(prices));
    
    await page.close();
    return prices;
};