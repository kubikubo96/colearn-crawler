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
  var subjects_number = 0;
  var topics_number = 0;
  var questions_number = 0;
  var limit_subjects = 0;
  var limit_topics = 0;
  var limit_questions = 20;

  const elmMenus = '.menu a';
  const elmTopics = '.chapter-item .sub-string';
  const elmQuestions = '#list_relate-quiz .quiz-relate-item a';

  /**
   * While list menu
   */
  while (1) {
    /**
     * B1. Go 1 subject
     */
    try {
      await page.waitForSelector(elmMenus).then(async () => {
        await page.$$eval(elmMenus, (element, subjects_number) => {
          element[subjects_number].click()
        }, subjects_number);

        console.log("subjects_number:" + subjects_number);
        // await page.waitForTimeout(2000);
      });
    } catch (error) {

    }

    /**
     * While list topic
     */
    while (1) {
      /**
        * B2. Go 1 topic
        */
      try {
        await page.waitForSelector(elmTopics).then(async () => {
          await page.$$eval(elmTopics, (element, topics_number) => {
            element[topics_number].click()
          }, topics_number);
          if (topics_number >= elmTopics.length) {
            subjects_number = subjects_number + 1;
          }
          console.log("topics_number:" + topics_number
          );
          // await page.waitForTimeout(2000);
        });
      } catch (error) {

      }

      /**
       * While list question
       */
      while (1) {
        /**
        * B3. Go 1 question
        */
        try {
          await page.waitForSelector(elmQuestions).then(async () => {
            await page.$$eval(elmQuestions, (element, questions_number) => {
              element[questions_number].click()
            }, questions_number);
            if (questions_number >= elmQuestions.length) {
              topics_number = topics_number + 1;
            }
            console.log("questions_number:" + questions_number);
            // await page.waitForTimeout(2000);
          });
        } catch (error) {

        }

        /**
        * B4. Get data questions
        */
        try {
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
            questions_number = questions_number + 1;
            // await page.waitForTimeout(2000);
            page.goBack()
          });
        } catch (error) {

        }

        //break
        if (questions_number > limit_questions) {
          console.log("_________---------------__________ DONE 1 STEP question _________---------------__________");
          console.log("|");
          console.log("|");
          console.log("|");
          break;
        }
      }

      //break
      page.goto(baseUrl)
      if (topics_number > limit_topics) {
        console.log("_________---------------__________ DONE 1 STEP topics _________---------------__________");
        console.log("|");
        console.log("|");
        console.log("|");
        break;
      }

    }

    //break
    page.goto(baseUrl)
    await page.waitForTimeout(500);
    if (subjects_number > limit_subjects) {
      console.log("_________---------------__________FINISH ALL! _________---------------__________"); console.log("|");
      console.log("|");
      console.log("|");
      break;
    }
  }
  // await browser.close();
})();