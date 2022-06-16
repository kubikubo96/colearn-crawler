const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // args: ['--window-size=1900,1000'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 0, height: 0 });
  const baseUrl = 'https://vungoi.vn'
  const mathUrl = 'https://vungoi.vn/lop-12/bai-tap-mon-toan-s5af3ead5f4ed8c11759c1ade.html'
  await page.goto(mathUrl);
  var chapterNumber = 1;

  const elmChapters = '.list-chapters .chapter-item';
  while (1) {
    await page.waitForSelector(elmChapters).then(async () => {
      await page.$$eval('.chapter-item .sub-string', (element, chapterNumber) => {
        element[chapterNumber].click()
      }, chapterNumber);
      
      await page.waitForTimeout(2000);
      await page.goto(mathUrl); // await page.goBack();

      console.log(chapterNumber);
      chapterNumber = chapterNumber + 1;
    });

    await page.waitForTimeout(2000);
    if (chapterNumber > 5) {
      break;
    }
  }

})();