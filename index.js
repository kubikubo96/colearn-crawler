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

  const elmMenus = '.menu a';
  const elmTopics = '.chapter-item .sub-string';
  const elmQuestions = '#list_relate-quiz .quiz-relate-item a';

  var data = [];
  var subjects_number = 0;
  var topics_number = 0;
  var questions_number = 0;
  // var limit_subjects = elmMenus.length;
  // var limit_topics = elmTopics.length;
  // var limit_questions = elmQuestions.length - 1;
  var limit_subjects = 0;
  var limit_topics = 0;
  var limit_questions = 10;

  /**
   * While list menu
   */
  while (1) {
    /**
     * B1. Go 1 subject
     */
    try {
      await page.waitForSelector(elmMenus).then(async () => {
        console.log("Go 1 subject");
        await page.$$eval(elmMenus, (element, subjects_number) => {
          element[subjects_number].click()
        }, subjects_number);

        console.log("subjects_number:" + subjects_number);
        // await page.waitForTimeout(2000);
      });
    } catch (error) {
      page.goto(baseUrl)
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
          if (topics_number >= limit_topics) {
            subjects_number = subjects_number + 1;
          }
          console.log("topics_number:" + topics_number
          );
          // await page.waitForTimeout(2000);
        });
      } catch (error) {
        await page.goBack()
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
            if (questions_number >= limit_questions) {
              topics_number = topics_number + 1;
            }
            console.log("questions_number:" + questions_number);
            // await page.waitForTimeout(2000);
          });
        } catch (error) {
          await page.goBack()
        }

        /**
        * B4. Get data questions
        */
        try {
          await page.waitForSelector('#quiz-single').then(async () => {
            await page.waitForTimeout(500);
            const tempData = await page.evaluate(async () => {
              let temp = [];
              let option = [];
              let imageQuestion = [];
              let elmName = document.querySelectorAll('#quiz-single .vn-tit-question strong');
              let elmTag = document.querySelectorAll('#quiz-single .vn-tit-question .clf');
              let elmQuestion = document.querySelectorAll('#quiz-single .content-quiz');
              let elmImageQuestion = document.querySelectorAll('.question-content .image-group img');
              let elmOption = document.querySelectorAll('.vn-box-answer .row > div');
              let elmSolution = document.querySelectorAll('.content-solution .solution-item p');
              let elmAnswer = document.querySelectorAll('#quiz-solution .solution-item div');
              let elmCorrectAnswer = document.querySelectorAll('.anwsers-correct span span');

              elmImageQuestion = [...elmImageQuestion]
              imageQuestion = await elmImageQuestion.map(item => ({
                src: item.getAttribute('src'),
                title: item.getAttribute('title')
              }));

              elmOption = [...elmOption]
              option = await elmOption.map(item => ({
                title: item.querySelector('.text-uppercase').textContent,
                content: item.querySelector('div p').textContent,
              }));

              temp.push({
                'name': elmName[0].textContent,
                'tag': elmTag[0].textContent,
                'question': elmQuestion[0].textContent,
                'image_question': imageQuestion,
                'option': option,
                'solution': elmSolution[1].textContent,
                'answer': elmAnswer[0].textContent,
                'correct_answer': elmCorrectAnswer[0].textContent,
              })
              return temp;
            });
            data = [...data, ...tempData]
            console.log(data);
            questions_number = questions_number + 1;
            // return;
            // await page.waitForTimeout(2000);
            await page.goBack()
          });
        } catch (error) {
          await page.goBack()
        }

        //break
        if (questions_number > limit_questions - 1) {
          console.log("*******  DONE 1 STEP QUESTON ************* \n");
          await page.goBack()
          break;
        }
      }

      //break
      // page.goto(baseUrl)
      if (topics_number > limit_topics - 1) {
        console.log("**********  DONE 1 STEP TOPIC *********** \n");
        await page.goBack()
        break;
      }
    }

    //break
    await page.waitForTimeout(2000);
    if (subjects_number > limit_subjects - 1) {
      console.log("************* !!! FINISH ALL !!!! ************* \n");
      break;
    }
  }
  // await browser.close();
})();