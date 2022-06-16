const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    // args: ['--window-size=1900,1000'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 0, height: 0 });
  const baseUrl = 'https://vungoi.vn/lop-12/bai-tap-mon-toan-s5af3ead5f4ed8c11759c1ade.html'
  await page.goto(baseUrl);
  var data = [];
  var subjects_number = 1;
  var topics = 1;
  var questions = 1;
  var limit = 5;

  const elmMenus = '.menu a';
  const elmTopics = '.chapter-item .sub-string';
  const elmQuestions = '#list_relate-quiz .quiz-relate-item a';
  while (1) {
    /**
     * B1. Go 1 subject
     */
    await page.waitForSelector(elmMenus).then(async () => {
      await page.$$eval(elmMenus, (element, subjects_number) => {
        element[subjects_number].click()
      }, subjects_number);

      subjects_number = subjects_number + 1;
    });


    /**
    * B2. Go 1 topic
    */
    await page.waitForSelector(elmTopics).then(async () => {
      await page.$$eval(elmTopics, (element, topics) => {
        element[topics].click()
      }, topics);

      topics = topics + 1;
    });

    /**
     * B3. Go 1 question
     */
    await page.waitForSelector(elmQuestions).then(async () => {
      await page.$$eval(elmQuestions, (element, questions) => {
        element[questions].click()
      }, questions);

      questions = questions + 1;
    });


    /**
    * B4. Get data questions
    */
    await page.waitForSelector('#quiz-single').then(async () => {
      const tempData = await page.evaluate(() => {
        let temp = [];
        let elmName = document.querySelectorAll('#quiz-single .vn-tit-question strong');
        let elmTag = document.querySelectorAll('#quiz-single .vn-tit-question .clf');

        temp.push({ 'name': elmName[0].textContent, 'tag': elmTag[0].textContent })

        return temp;
      });
      data = [...data, ...tempData]
      console.log(data);
    });


    /**
     * B5
     */
    page.goto(baseUrl)

    /**
     * End
     */
    await page.waitForTimeout(2000);
    if (questions >= limit - 1) {
      console.log("_________++++++++++ FINISH! ++++++++++_________");
      break;
    }
  }
  await browser.close();
})();