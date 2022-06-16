const HCCrawler = require('headless-chrome-crawler');
const axios = require('axios').default;

(async () => {
  const crawler = await HCCrawler.launch({
    // Function to be evaluated in browsers
    evaluatePage: (() => ({
      title: $('.title.position-relative').text(),
    })),
    // Function to be called with evaluated results from browsers
    onSuccess: (result => {
      console.log(result.result);
      axios({
        method: 'post',
        url: 'http://basic.laravel.local/crawler',
        data: result.result
      })
        .then(function (response) {
          console.log(response.data)
        });
    }),
  });
  await crawler.queue(['https://colearn.vn/']);

  await crawler.onIdle(); // Resolved when no queue is left
  await crawler.close(); // Close the crawler
})();