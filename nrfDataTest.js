const puppeteer = require("puppeteer");
const axios = require("axios");

const URL_TO_VISIT =
  "https://events.nrf.com/annual2023/Public/eventmap.aspx?shmode=E&thumbnail=1";

const url =
  "https://img14.a2zinc.net/api/exhibitor?mapId=119&eventId=167&appId=VEANgX18thjf0ErIFC5hDuFEAu9oy033HnuyF7j4IFnEursxdYEROXEzR7yFZCmI&floorplanViewType=View4&langId=1&boothId=&shMode=E&minLblSize=2&maxLblSize=10&minCnSize=2&maxCnSize=11&_=1670897680974";

const nrfUrl =
  "https://events.nrf.com/api/exhibitor?callback=jQuery21107813700514283519_1670897680967&mapId=119&eventId=167&appId=VEANgX18thjf0ErIFC5hDuFEAu9oy033HnuyF7j4IFnEursxdYEROXEzR7yFZCmI&floorplanViewType=View4&langId=1&boothId=&shMode=E&minLblSize=2&maxLblSize=10&minCnSize=2&maxCnSize=11&_=1670897680974";

// async function main() {
//   const browers = await puppeteer.launch({ headless: false });

//   const page = await browers.newPage();

//   await page.goto(URL_TO_VISIT, { waitUntil: "networkidle2" });

//   //   await page.waitFor(1000);
//   console.log("Waited for 1000");
//   await page.waitForSelector(".modal-body");
//   console.log("Waited for .modal-body");

//   const result = await page.evaluate(() => {
//     // document.querySelector('.modal-body li[data-id="119"] a')?.click();
//     document.querySelector(".modal-body li:nth-child(1) a")?.click();
//     console.log(window.boothsInthisTile);
//     // console.log(boothsInthisTile);
//     const data = window;
//     return data;
//   });

//   console.log("Booth result is");
//   console.log(result);

//   //   await browers.close();
// }

async function main() {
  const res = await axios.get(url);
  console.log(res.data[0]);
}

main();

// let url =
//   "https://img14.a2zinc.net/api/exhibitor?mapId=119&eventId=167&appId=VEANgX18thjf0ErIFC5hDuFEAu9oy033HnuyF7j4IFnEursxdYEROXEzR7yFZCmI&floorplanViewType=View4&langId=1&boothId=&shMode=E&minLblSize=2&maxLblSize=10&minCnSize=2&maxCnSize=11&_=1670897680974";
// $.get(url, function (data) {
//   console.log(typeof data); // string
//   console.log(data); // HTML content of the jQuery.ajax page
// });
