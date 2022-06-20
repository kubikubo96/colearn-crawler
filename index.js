const puppeteer = require('puppeteer');
const axios = require('axios').default;
require('dotenv').config();
const fs = require('fs');
const { exit } = require('process');


(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    // args: ['--window-size=1900,1000'],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(0);

  const listSubjects = [
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-toan-s5af3ead5f4ed8c11759c1ade.html', 'name': 'toan' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-ly-s5af3ead5f4ed8c11759c1add.html', 'name': 'ly' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-hoa-s5af3ead5f4ed8c11759c1adc.html', 'name': 'hoa' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-sinh-s5af3ead5f4ed8c11759c1adb.html', 'name': 'sinh' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-van-s5d14722fbcafcc004810c09f.html', 'name': 'van' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-tieng-anh-s5b7f644c5b9305855ffadced.html', 'name': 'anh' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-tieng-anh-moi-s5f1e3ac59d96250022154460.html', 'name': 'anh-new' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-su-s5b3d7dd3d9e263cf2e5a16c3.html', 'name': 'su' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-dia-s5b3d7ddcd9e263cf2e5a16c4.html', 'name': 'dia' },
    { 'url': 'https://vungoi.vn/lop-12/bai-tap-mon-gdcd-s5d61eaf3ea5cb900220fa953.html', 'name': 'gdcd' },
  ];

  const TIME_OUT = 1000;

  const elmTopics = '.list-chapters .sub-string';
  const elmQuestions = '#list_relate-quiz .quiz-relate-item a';

  var data = [];
  var total = 0;

  var limit_subjects = 10;
  var limit_topics = 1;
  var limit_questions = 0;

  var number_subjects = 0;
  var number_topics = 30;
  var number_questions = 39;

  var title_subject = '';
  var name_topic = '';

  /**
   * While list menu
   */
  while (1) {
    /**
     * B1. Go 1 subject
     */
    try {
      await page.goto(listSubjects[number_subjects].url)

      title_subject = await page.$$eval('.menu .menu__item-name', (elm, number_subjects) => {
        return elm[number_subjects].getAttribute('title')
      }, number_subjects);
    } catch (error) {
      await sendTele(error, [], 'waitForSelector elmSubjects');
    }

    /**
     * While list topic
     */
    while (1) {
      /**
        * B2. Go 1 topic
        */
      try {
        await page.waitForSelector(elmTopics, { timeout: TIME_OUT }).then(async () => {

          limit_topics = await page.$$eval(elmTopics, (elm) => elm.length);

          name_topic = await page.$$eval(elmTopics, (elm, number_topics) => {
            return elm[number_topics].getAttribute('title')
          }, number_topics);

          await page.$$eval(elmTopics, (element, number_topics) => {
            element[number_topics].click()
          }, number_topics);
        });
      } catch (error) {
        await sendTele(error, [], 'waitForSelector elmTopics');
      }

      /**
       * While list question
       */
      while (1) {
        /**
        * B3. Go 1 question
        */
        try {
          await page.waitForSelector(elmQuestions, { timeout: TIME_OUT }).then(async () => {

            limit_questions = await page.$$eval(elmQuestions, (elm) => elm.length);

            await page.$$eval(elmQuestions, (element, number_questions) => {
              element[number_questions].click()
            }, number_questions);

            console.log("[subjects] limit:  " + limit_subjects + ", number:  " + (number_subjects + 1));
            console.log("[topics] limit:    " + limit_topics + ", number:  " + (number_topics + 1));
            console.log("[questions] limit: " + limit_questions + ", number: " + (number_questions + 1));
          });

        } catch (error) {
          await sendTele(error, [], 'waitForSelector elmQuestions');
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
        let elmCorrectAnswer = '.anwsers-correct span span';
        let elmSolution = '.content-solution .solution-item p';
        let elmAnswer = '#quiz-solution .solution-item div';
        let elmNote = '.content-solution .note';
        let elmListRelate = '#list-quiz-relate .row.quiz-relate-item a';

        let temp_data = {
          'url_question': '',
          'title_subject': title_subject,
          'name_subject': listSubjects[number_subjects].name,
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
          'list_relate': []
        }

        /**
         * Get URL Question
         */
        try {
          await page.waitForSelector('#quiz-single', { timeout: TIME_OUT }).then(() => {
            temp_data.url_question = page.url();
          })
        } catch (error) {
          // sendTele(error, temp_data, 'GET Name', page.url());
        }

        /**
         * GET Name
         */
        try {
          await page.waitForSelector(elmName, { timeout: TIME_OUT }).then(async () => {
            temp_data.name = await page.$$eval(elmName, (elm) => elm[0].textContent);
          })
        } catch (error) {
          // sendTele(error, temp_data, 'GET Name', page.url());
        }

        /**
        * GET Tag
        */
        try {
          await page.waitForSelector(elmTag, { timeout: TIME_OUT }).then(async () => {
            temp_data.tag = await page.$$eval(elmTag, (elm) => elm[0].textContent);
          })
        } catch (error) {
          // sendTele(error, temp_data, ' GET Tag', page.url());
        }

        /**
        * GET Question
        */
        try {
          await page.waitForSelector(elmQuestion, { timeout: TIME_OUT }).then(async () => {
            temp_data.question = await page.$$eval(elmQuestion, (elm) => elm[0].textContent);
          })
        } catch (error) {
          // sendTele(error, temp_data, 'GET Question', page.url());
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
          // sendTele(error, temp_data, 'GET Image', page.url());
        }


        /**
        * GET Option
        */
        try {
          await page.waitForSelector(elmOption, { timeout: TIME_OUT }).then(async () => {
            temp_data.url_question = page.url();
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
          // sendTele(error, temp_data, 'GET Option', page.url());
        }

        /**
        * GET Solution
        */
        try {
          await page.waitForSelector(elmSolution, { timeout: TIME_OUT }).then(async () => {
            temp_data.solution = await page.$$eval(elmSolution, (elm) => elm[1].textContent);
          })
        } catch (error) {
          // sendTele(error, temp_data, 'GET Solution', page.url());
        }

        /**
        * GET Answer
        */
        try {
          await page.waitForSelector(elmAnswer, { timeout: TIME_OUT }).then(async () => {
            temp_data.answer = await page.$$eval(elmAnswer, (elm) => elm[0].textContent);
          })
        } catch (error) {
          // sendTele(error, temp_data, 'GET Answer', page.url());
        }

        /**
        * GET Correct answer
        */
        try {
          await page.waitForSelector(elmCorrectAnswer, { timeout: TIME_OUT }).then(async () => {
            temp_data.correct_answer = await page.$$eval(elmCorrectAnswer, (elm) => elm[0].textContent);
          })
        } catch (error) {
          // sendTele(error, temp_data, 'GET Correct answer', page.url());
        }

        /**
        * GET Note
        */
        try {
          await page.waitForSelector(elmNote, { timeout: TIME_OUT }).then(async () => {
            temp_data.note = await page.$$eval(elmNote, (elm) => elm[0].textContent);
          })
        } catch (error) {
          // sendTele(error, temp_data, 'GET Note', page.url());
        }


        /**
        * GET List relate
        */
        try {
          await page.waitForSelector(elmListRelate, { timeout: TIME_OUT }).then(async () => {
            const image_question = await page.evaluate(async (elmListRelate) => {
              let elm = document.querySelectorAll(elmListRelate)
              elm = [...elm]
              let data = elm.map(item => ({
                href: item.getAttribute('href'),
              }));
              return data;
            }, elmListRelate)
            temp_data.list_relate = image_question;
          })
        } catch (error) {
          // sendTele(error, temp_data, 'GET Image', page.url());
        }

        /**
         * push data
         */
        if (number_questions < limit_questions) {
          data.push(temp_data)
          number_questions = number_questions + 1;
          total = total + 1;

          console.log("=================================");
          console.log("||          " + total + "       ||");
          console.log("=================================");

          await page.goBack()
        }

        /**
         * break questions
         */
        if (number_questions >= limit_questions) {
          number_topics = number_topics + 1;
          number_questions = 0;
          await saveData(data);

          let name_file = (temp_data.url_question).replace("https://vungoi.vn/", "");


          fs.writeFileSync('tmp/' + name_file + '.json', JSON.stringify(data));
          await page.goto(listSubjects[number_subjects].url)
          data = [];
          console.log("**********  DONE 1 STEP TOPIC *********** \n");
          break;
        }
      }

      /**
       * break topic
       */
      if (number_topics >= limit_topics) {
        number_subjects = number_subjects + 1;
        number_topics = 0;
        console.log("**********  DONE 1 STEP TOPIC *********** \n");
        await page.goto(listSubjects[number_subjects].url);
        break;
      }
    }

    /**
     * break subjects: Finish
     */
    if (number_subjects >= limit_subjects) {
      console.log("************* !!! FINISH ALL !!!! ************* \n");
      break;
    }
  }
  // await browser.close();
})();


async function sendTele(error, data_tpm = [], note = '', url = '', line = 0) {
  let html = '';
  html += '<b>[Error] : </b><code>' + JSON.stringify(error) + '</code> \n';
  html += '<b>[Message] : </b><code>' + note + '</code> \n';
  html += '<b>[URL] : </b><code>' + url + '</code> \n';
  html += '<b>[Line] : </b><code>' + line + '</code> \n';
  html += '<b>[Data] : </b><code>' + JSON.stringify(data_tpm) + '</code> \n';

  try {
    await axios.post(process.env.TELE_URL, {
      chat_id: process.env.TELE_CHAT_ID,
      text: html,
    }).then(function (response) {
    });
  } catch (error) {
    console.log('LOCAL LOG: ERROR SEND TELEGRAM');
    console.log(error);
    exit;
  }
}

async function saveData(data) {
  try {
    await axios.post(process.env.HOST_LOCAL, data)
      .then(function (response) {

      })
      .catch(function (error) {
        sendTele(error, data, 'Error Saved Database');
      });
  } catch (error) {
    sendTele(error, data, 'LOCAL LOG: ERROR SAVE DATA');
  }
}