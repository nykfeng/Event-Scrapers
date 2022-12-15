const puppeteer = require("puppeteer");
const axios = require("axios");

const URL_TO_VISIT =
  "https://events.clarionevents.com/IRFSNY2023/Public/EventMap.aspx?shMode=E&ID=79924";

async function main() {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

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
      await new Promise((r) => setTimeout(r, 1000));

      td.querySelector("a.exhibitorName").click();
      await new Promise((r) => setTimeout(r, 3000));

      const iframeEl = document.querySelector(".modal-content iframe")
        ?.contentWindow.document;
      const contactInfoEl = iframeEl.querySelector(".panel-body");
      let cityName =
        contactInfoEl
          .querySelector(".BoothContactCity")
          ?.textContent.replaceAll(/\n/g, "") ?? "";
      let stateName =
        contactInfoEl
          .querySelector(".BoothContactState")
          ?.textContent.replaceAll(/\n/g, "") ?? "";
      let countryName =
        contactInfoEl
          .querySelector(".BoothContactCountry")
          ?.textContent.replaceAll(/\n/g, "") ?? "";
      let url =
        contactInfoEl.querySelector(".BoothContactUrl")?.textContent ?? "";

      const descriptionContainerEl = iframeEl.querySelector("#eboothContainer");
      const allParagraphEls = descriptionContainerEl.querySelectorAll("p");

      let description = "";
      if (allParagraphEls) {
        allParagraphEls.forEach((p) => {
          if (p.textContent) description += p.textContent.replaceAll(/\n/g, "");
        });
      }

      description.replaceAll(/\t/g, "");

      let boothSize =
        document.querySelector(".leaflet-popup-content .fpPopupBoothSize")
          ?.textContent || "";

      if (boothSize !== "") {
        boothSize = boothSize.includes("Size: ")
          ? boothSize.replace("Size: ", "")
          : boothSize;
      }

      result.push({
        companyName,
        booth,
        boothSize,
        description,
        cityName,
        stateName,
        countryName,
        url,
      });

      // if (companyName === "Clean Air Group") break;
    }

    // });

    return JSON.stringify(result);
  });

  await browser.close();

  console.log("Data after scraping");
  console.log(data);
}

main();
