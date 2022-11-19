const puppeteer = require("puppeteer");
const axios = require("axios");

const URL_TO_VISIT =
  "https://events.clarionevents.com/IRFSNY2023/Public/EventMap.aspx?shMode=E&ID=79924";

async function main() {
  const browers = await puppeteer.launch({ headless: false });

  const page = await browers.newPage();

  await page.goto(URL_TO_VISIT);

  // page.evaluate is used to interact with the page DOM
  // https://stackoverflow.com/questions/52045947/nodejs-puppeteer-how-to-use-page-evaluate

  const data = await page.evaluate(async () => {
    const result = [];

    document.querySelector("button.abtn-ExhibitorList").click();
    const tableData = document.querySelectorAll(".listTableBody tbody tr");
    // tableData.forEach((td) => {

    for (const td of tableData) {
      const companyName = td.querySelector(".exhibitorName").textContent;
      const booth = td.querySelector(".boothLabel").textContent;
      td.querySelector(".boothLabel a").click();

      await new Promise((r) => setTimeout(r, 3000));

      //   await page.waitForSelector(".leaflet-popup-content .fpPopupBoothSize");
      const boothSize = document.querySelector(
        ".leaflet-popup-content .fpPopupBoothSize"
      ).textContent;

      if (boothSize !== "") {
        boothSize = boothSize.includes("Size: ")
          ? boothSize.replace("Size: ", "")
          : boothSize;
      }

      result.push({
        companyName,
        booth,
        boothSize,
      });
    }

    // });

    return JSON.stringify(result);
  });

  console.log("Data after scraping");
  console.log(data);

  //   await browser.close();
}

main();
