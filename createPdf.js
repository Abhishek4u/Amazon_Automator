let puppeteer = require("puppeteer");
module.exports.pdfCreater = (async function () {

  /** Launch a headless browser  because generate pdf function works only in headless mode*/
  let browser = await puppeteer.launch();

  let page = await browser.newPage();

  await page.goto("C:/Users/Anshul/Desktop/Amazon_Puppeteer/build.html", { waitUntil: 'networkidle0' });

  await page.pdf({
    path: 'generated.pdf',
    format: 'A4',
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });

  await browser.close();
});
