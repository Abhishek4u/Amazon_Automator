let puppeteer = require("puppeteer");
let fs = require("fs");
let prompt = require('prompt-sync')();
let CFonts = require('cfonts');


let { htmlCreater } = require("./createTable");
let { pdfCreater } = require("./createPdf");

let priceBracket;
let tabToBeSelected;
let allElectronics = [];

async function interface() {
    CFonts.say(`Enter Your Choice
1. Mobiles
2. Laptops`, { font: 'simple', colors: ['#f76f57'], gradient: ['green', 'red'] });
    let typeOfElectronics = prompt();

    if (typeOfElectronics == 1) {
        CFonts.say(`Enter the Price Range
1. Below 5000
2. 5k TO 10k
3. 10k TO 15k
4. 15k TO 20k
5. 20k TO 25k
6. Above 25k `, { font: 'simple', colors: ['#1be02b'], gradient: ['red', 'green'] });
        priceBracket = prompt();
        tabToBeSelected = 0;

    } else if(typeOfElectronics == 2) {
        CFonts.say(`Enter the Price Range
1. Under 20k
2. 20k TO 30k
3. 30k TO 40k
4. 40k TO 50k
5. 50k TO 70k
6. Above 70k `, { font: 'simple', colors: ['#1be02b'], gradient: ['red', 'green'] });
        priceBracket = prompt();
        tabToBeSelected = 4;
    }
    else{
        console.log("Wrong Input");
        throw new Error("Wrong Input Given!");
    }
    priceBracket = parseInt(priceBracket) + 15;

    CFonts.say(`There you go `,{font:'block',colors:['#34eb93','#eb345f']})

}

(async function () {
    try {

        await interface();

        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"]
        })

        let tabs = await browser.pages();
        let tab = tabs[0];
        await tab.setDefaultNavigationTimeout(0);

        await tab.goto("https://www.amazon.in/", { waitUntil: "networkidle2" });

        await tab.waitForSelector("#nav-xshop");

        let nextTab = await tab.$$("#nav-xshop a");

        let hrefmain = await tab.evaluate(function (elem) {
            return "https://www.amazon.in/" + elem.getAttribute("href");
        }, nextTab[tabToBeSelected]);

        await Promise.all([tab.goto(hrefmain),
        tab.waitForNavigation({ waitUntil: "networkidle2" })]);

        if (tabToBeSelected == 4) {
            let laptopsURL = `https://www.amazon.in/s/ref=mega_elec_s23_2_1_1_1?rh=i%3Acomputers%2Cn%3A1375424031&ie=UTF8&bbn=976392031`
            await Promise.all([tab.goto(laptopsURL),
            tab.waitForNavigation({ waitUntil: "networkidle2" })]);
        }

        await tab.waitForSelector(".bxc-grid__image");

        let priceBracketTab = await tab.$$(`.bxc-grid__image a`);

        //For scrolling into elements
        await tab.evaluate(async () => {
            for (let iframe of Array.from(document.querySelectorAll(`.bxc-grid__image a`))) {
              iframe.scrollIntoView();
              await new Promise((resolve) => { setTimeout(resolve, 250); });
            }
          });

        //   old one scrolling method
        // await tab.$eval(`.bxc-grid__image a`,(el) => el.scrollIntoView({ behavior: 'smooth' }));

        let priceHref = await tab.evaluate(function (elt) {
            return "https://www.amazon.in/" + elt.getAttribute("href");
        }, priceBracketTab[priceBracket]);

        // console.log(priceHref);

        await Promise.all([tab.goto(priceHref),
        tab.waitForNavigation({ waitUntil: "networkidle2" })]);

        let length = await tab.evaluate(() => {
            let data = document.querySelectorAll(".a-pagination .a-disabled")[1];
            if (data == undefined) {
                data = document.querySelectorAll(".a-pagination li").length;
                data = data - 2;
            } else {
                data = data.innerText;
            }
            return data;
        })

        // console.log(length);

        let globalURL = await tab.evaluate(() => {
            return "https://www.amazon.in/" + document.querySelectorAll(".a-normal a")[0].getAttribute("href");
        })


        let allPagesWillBeServedPromise = [];

        for (let i = 1; i <= length; i++) { 

            let pageSpecificUrl = globalURL.replace("page=2", `page=${i}`);
            pageSpecificUrl = pageSpecificUrl.replace("pg_2", `pg-${i}`)

            let newTab = await browser.newPage();
            let nameAndPriceObject = handleSinglePage(newTab, pageSpecificUrl);
            allPagesWillBeServedPromise.push(nameAndPriceObject);

        }

        await Promise.all(allPagesWillBeServedPromise);

        // await tab.close();

        // console.table(allElectronics);

        await fs.writeFileSync("electronics.json", JSON.stringify(allElectronics));

        await htmlCreater();

        await tab.goto("C:/Users/Anshul/Desktop/Amazon_Puppeteer/build.html"); 

        await pdfCreater();

        

        await tab.waitFor(15000);

        let pdfTab = await browser.newPage();

        await pdfTab.goto("C:/Users/Anshul/Desktop/Amazon_Puppeteer/generated.pdf")

        await pdfTab.waitFor(15000);

        await tab.close();

        await pdfTab.close();
    }
    catch (err) {
        console.log(err);
    }
})()

async function handleSinglePage(newTab, link) {

    try {
        await newTab.setDefaultNavigationTimeout(0);

        await newTab.goto(link, { waitUntil: "networkidle2" });

        let listRow = await newTab.$$(".s-result-list div .celwidget");

        // console.log(listRow.length);

        //For scrolling into elements
        await newTab.evaluate(async () => {
            for (let iframe of Array.from(document.querySelectorAll('.s-result-list div .celwidget'))) {
              iframe.scrollIntoView();
              await new Promise((resolve) => { setTimeout(resolve, 200); });
            }
          });

        for (let i = 0; i < listRow.length; i++) {

            let name = await newTab.evaluate((i) => {
                let data = document.querySelectorAll(".s-result-list div .celwidget")[i].querySelectorAll(".sg-col-20-of-28 .sg-row .sg-col-inner .a-color-base a span")[0];
                if (data != undefined) {
                    data = data.innerHTML;
                    return data;
                }
                else return null;

            }, i)

            let originalPrice = await newTab.evaluate((i) => {
                let data = document.querySelectorAll(".s-result-list div .celwidget")[i].querySelectorAll(".sg-col-20-of-28 .sg-row .sg-col-inner .a-color-base a span")[7];
                if (data != undefined) {
                    data = data.innerHTML;
                    return data;
                }
                else return null;
            }, i)

            if (originalPrice == null) continue

            let discountedPrice = await newTab.evaluate((i) => {
                let data = document.querySelectorAll(".s-result-list div .celwidget")[i].querySelectorAll(".sg-col-20-of-28 .sg-row .sg-col-inner .a-color-base a span")[2];

                if (data != undefined) {
                    data = data.innerHTML;
                    return data;
                }
                else return null;
            }, i)

            let obj = {
                "Name": name,
                "DiscountedPrice": discountedPrice,
                "OriginalPrice": originalPrice
            }
            
            await allElectronics.push(obj);
        }
        await newTab.close();
    }
    catch (err) {
        console.log(err);
    }
}