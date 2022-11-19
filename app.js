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

  const data = await page.evaluate(() => {
    const result = [];

    document.querySelector("button.abtn-ExhibitorList").click();
    const tableData = document.querySelectorAll(".listTableBody tbody tr");
    tableData.forEach((td) => {
      result.push({
        companyName: td.querySelector(".exhibitorName").textContent,
        booth: td.querySelector(".boothLabel").textContent,
      });
    });
    return JSON.stringify(result);
  });

  console.log("Data after scraping");
  console.log(data);

  //   await browser.close();
}

main();
