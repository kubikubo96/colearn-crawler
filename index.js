const puppeteer = require('puppeteer');
const axios = require('axios').default;
const fs = require('fs');
require('dotenv').config();


(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    // args: ['--window-size=1900,1000'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 0, height: 0 });
  const baseUrl = 'https://vungoi.vn/lop-12/bai-tap-mon-toan-s5af3ead5f4ed8c11759c1ade.html'
  await page.goto(baseUrl);

  const TIME_OUT = 1000;

  const elmSubjects = '.menu a';
  const elmTopics = '.list-chapters .sub-string';
  const elmQuestions = '#list_relate-quiz .quiz-relate-item a';

  var data = [];
  var total = 0;
  var number_subjects = 0;
  var number_topics = 0;
  var number_questions = 0;

  var limit_subjects = 0;
  var limit_topics = 0;
  var limit_questions = 0;

  var name_subject = '';
  var name_topic = '';

  /**
   * While list menu
   */
  while (1) {
    /**
     * B1. Go 1 subject
     */
    try {
      await page.waitForSelector(elmSubjects).then(async () => {

        // limit_subjects = await page.$$eval(elmSubjects, (elm) => elm.length);
        name_subject = await page.$$eval('.menu .menu__item-name', (elm, number_subjects) => {
          return elm[number_subjects].getAttribute('title')
        }, number_subjects);

        await page.$$eval(elmSubjects, (element, number_subjects) => {
          element[number_subjects].click()
        }, number_subjects);
      });
    } catch (error) {
      sendTele(error, [], 'waitForSelector elmSubjects');
      // page.goto(baseUrl)
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

          // limit_topics = await page.$$eval(elmTopics, (elm) => elm.length);
          name_topic = await page.$$eval(elmTopics, (elm, number_topics) => {
            return elm[number_topics].getAttribute('title')
          }, number_topics);

          await page.$$eval(elmTopics, (element, number_topics) => {
            element[number_topics].click()
          }, number_topics);
          if (number_topics > limit_topics) {
            number_subjects = number_subjects + 1;
          }
        });
      } catch (error) {
        sendTele(error, [], 'waitForSelector elmTopics');
        // await page.goBack()
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

            limit_questions = await page.$$eval(elmQuestions, (elm) => elm.length);

            await page.$$eval(elmQuestions, (element, number_questions) => {
              element[number_questions].click()
            }, number_questions);
            if (number_questions > limit_questions) {
              number_topics = number_topics + 1;
            }

            console.log("[subjects] limit:  " + limit_subjects + ", number:  " + number_subjects);
            console.log("[topics] limit:    " + limit_topics + ", number:  " + number_topics);
            console.log("[questions] limit: " + limit_questions + ", number: " + number_questions);

          });

        } catch (error) {
          sendTele(error, [], 'waitForSelector elmQuestions');
          // await page.goBack()
        }

        /**
        * B4. Get data questions
        */
        // try {
        let elmName = '#quiz-single .vn-tit-question strong';
        let elmTag = '#quiz-single .vn-tit-question .clf';
        let elmQuestion = '#quiz-single .content-quiz';
        let elmImageQuestion = '#quiz-single img';
        let elmOption = '.vn-box-answer .row > div';
        let elmSolution = '.content-solution .solution-item p';
        let elmAnswer = '#quiz-solution .solution-item div';
        let elmCorrectAnswer = '.anwsers-correct span span';
        let elmNote = '.content-solution .note';

        let temp_data = {
          'url_question': '',
          'name_subject': name_subject,
          'name_topic': name_topic,
          'name': '',
          'tag': '',
          'question': '',
          'image_question': [],
          'option': [],
          'solution': '',
          'answer': '',
          'correct_answer': '',
          'note': '',
        }


        /**
         * Get URL Question
         */
        await page.waitForTimeout('#quiz-single', { timeout: TIME_OUT }).then(() => {
          temp_data.url_question = page.url();
        })

        /**
         * GET Name
         */
        try {
          await page.waitForSelector(elmName, { timeout: TIME_OUT }).then(async () => {
            temp_data.name = await page.$$eval(elmName, (elm) => elm[0].textContent);
          })
        } catch (error) {
          sendTele(error, temp_data, 'GET Name', page.url());
        }

        /**
        * GET Tag
        */
        try {
          await page.waitForSelector(elmTag, { timeout: TIME_OUT }).then(async () => {
            temp_data.tag = await page.$$eval(elmTag, (elm) => elm[0].textContent);
          })
        } catch (error) {
          sendTele(error, temp_data, ' GET Tag', page.url());
        }

        /**
        * GET Question
        */
        try {
          await page.waitForSelector(elmQuestion, { timeout: TIME_OUT }).then(async () => {
            temp_data.question = await page.$$eval(elmQuestion, (elm) => elm[0].textContent);
          })
        } catch (error) {
          sendTele(error, temp_data, 'GET Question', page.url());
        }

        /**
        * GET Image
        */
        try {
          await page.waitForSelector(elmImageQuestion, { timeout: TIME_OUT }).then(async () => {
            const image_question = await page.evaluate(async (elmImageQuestion) => {
              let elm = document.querySelectorAll(elmImageQuestion)
              elm = [...elm]
              let data = elm.map(item => ({
                src: item.getAttribute('src'),
                title: item.getAttribute('title')
              }));
              return data;
            }, elmImageQuestion)
            temp_data.image_question = image_question;
          })
        } catch (error) {
          sendTele(error, temp_data, 'GET Image', page.url());
        }


        /**
        * GET Option
        */
        try {
          await page.waitForSelector(elmOption, { timeout: TIME_OUT }).then(async () => {
            const option = await page.evaluate(async (elmOption) => {
              let elm = document.querySelectorAll(elmOption)
              elm = [...elm]
              let data = elm.map(item => ({
                title: item.textContent.charAt(0),
                content: item.textContent.slice(2),
              }));
              return data;
            }, elmOption)
            temp_data.option = option;
          })

        } catch (error) {
          sendTele(error, temp_data, 'GET Option', page.url());
        }

        /**
        * GET Solution
        */
        try {
          await page.waitForSelector(elmSolution, { timeout: TIME_OUT }).then(async () => {
            temp_data.solution = await page.$$eval(elmSolution, (elm) => elm[1].textContent);
          })
        } catch (error) {
          sendTele(error, temp_data, 'GET Solution', page.url());
        }

        /**
        * GET Answer
        */
        try {
          await page.waitForSelector(elmAnswer, { timeout: TIME_OUT }).then(async () => {
            temp_data.answer = await page.$$eval(elmAnswer, (elm) => elm[0].textContent);
          })
        } catch (error) {
          sendTele(error, temp_data, 'GET Answer', page.url());
        }

        /**
        * GET Correct answer
        */
        try {
          await page.waitForSelector(elmCorrectAnswer, { timeout: TIME_OUT }).then(async () => {
            temp_data.correct_answer = await page.$$eval(elmCorrectAnswer, (elm) => elm[0].textContent);
          })
        } catch (error) {
          sendTele(error, temp_data, 'GET Correct answer', page.url());
        }

        /**
        * GET Note
        */
        try {
          await page.waitForSelector(elmNote, { timeout: TIME_OUT }).then(async () => {
            temp_data.note = await page.$$eval(elmNote, (elm) => elm[0].textContent);
          })
        } catch (error) {
          sendTele(error, temp_data, 'GET Note', page.url());
        }

        data.push(temp_data)
        number_questions = number_questions + 1;
        total = total + 1;

        console.log("=================================");
        console.log("||          " + total + "       ||");
        console.log("=================================");

        await page.goBack()
        // await page.waitForTimeout(2000 * 1000);

        //break
        if (number_questions >= limit_questions) {
          number_questions = 0;
          await page.goBack()
          break;
        }
      }

      //break
      if (number_topics >= limit_topics) {
        saveData(data);
        number_topics = 0;
        console.log("**********  DONE 1 STEP TOPIC *********** \n");
        await page.goBack()
        break;
      }
    }

    //break
    await page.waitForTimeout(2000);
    if (number_subjects >= limit_subjects) {
      fs.writeFileSync('questions.json', JSON.stringify(data));
      console.log("************* !!! FINISH ALL !!!! ************* \n");
      break;
    }
  }
  // await browser.close();
})();


function sendTele(error, data_tpm = [], note = '', url = '', line = 0) {
  if (error.name != 'TimeoutError') {
    let html = '';
    html += '<b>[Lỗi] : </b><code>' + JSON.stringify(error) + '</code> \n';
    html += '<b>[Note] : </b><code>' + note + '</code> \n';
    html += '<b>[URL] : </b><code>' + url + '</code> \n';
    html += '<b>[line] : </b><code>' + line + '</code> \n';
    html += '<b>[data] : </b><code>' + JSON.stringify(data_tpm) + '</code> \n';

    axios.post(process.env.TELE_URL, {
      chat_id: process.env.TELE_CHAT_ID,
      text: html,
    }).then(function (response) {
    })
      .catch(function (error) {
      });
  }
}

function saveData(data) {
  axios.post(process.env.HOST_LOCAL, data)
    .then(function (response) {

    })
    .catch(function (error) {
      sendTele(error, data, 'Error Saved Database');
    });
}