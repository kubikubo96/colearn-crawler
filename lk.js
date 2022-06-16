const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://vungoi.vn/lop-12/bai-tap-mon-toan-s5af3ead5f4ed8c11759c1ade.html')

  const slug = await page.evaluate(() => {
    let titleLinks = document.querySelectorAll('.list-chapters .chapter-item a.sub-string');
    titleLinks = [...titleLinks];
    let slug = titleLinks.map(link => ({
      url: link.getAttribute('href')
    }));
    return slug;
  });

  console.log(slug[0].url);
  // fs.writeFileSync('slugs.json', JSON.stringify(slug));
  // await browser.close();
})();