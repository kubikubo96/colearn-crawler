const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // args: ['--window-size=1900,1000'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 0, height: 0 });
  await page.goto('https://vungoi.vn/lop-12/bai-tap-mon-toan-s5af3ead5f4ed8c11759c1ade.html');

  await page.waitForSelector('.chapter-item .sub-string').then(() => {
    console.log("STEP 1");
    page.$$eval('.chapter-item .sub-string', (elm) => elm[0].click());
  });

  await page.waitForSelector('a[href=cau-hoi-13]').then(() => {
    console.log("STEP 2");
    page.$eval('a[href=cau-hoi-13]', (elm) => elm.click());
  });

  await page.waitForSelector('#quiz-solution a').then(() => {
    console.log("STEP 3");
    page.$$eval('#quiz-solution a', (elm) => elm[0].click());
  });

  await page.waitForSelector('#quiz-single .content-quiz').then(() => {
    console.log("STEP 4");
    page.$$eval('#quiz-single .content-quiz', (elm) => console.log(elm[0].textContent));
  });

  await page.waitForSelector('#quiz-single .vn-box-answer .row div').then(() => {
    console.log("STEP 5");
    page.$$eval('#quiz-single .vn-box-answer .row div', (elm) => console.log(elm[0].textContent));
  });

  // await browser.close();
})();