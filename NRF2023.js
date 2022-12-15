const puppeteer = require("puppeteer");

const URL_TO_VISIT =
  "https://events.nrf.com/annual2023/Public/eventmap.aspx?shmode=E&thumbnail=1";

async function main() {
  const browers = await puppeteer.launch({ headless: false });

  const page = await browers.newPage();

  await page.goto(URL_TO_VISIT, { waitUntil: "networkidle2" });

  //   await page.waitFor(1000);
  console.log("Waited for 1000");
  await page.waitForSelector(".modal-body");
  console.log("Waited for .modal-body");

  await page.evaluate(() => {
    // document.querySelector('.modal-body li[data-id="119"] a')?.click();
    document.querySelector('.modal-body li:nth-child(1) a')?.click();
  });

  // await page.waitForSelector(".leaflet-zoom-animated");

  const numberOfBooth = await page.evaluate(() => {
    const allBoothEls = document.querySelectorAll(
      ".map-parent .leaflet-overlay-pane svg g"
    );

    return allBoothEls.length;
  });

  console.log("numberOfBooth: ");
  console.log(numberOfBooth);

  await page.waitForSelector(".leaflet-clickable"); 
  //   await page.hover(".leaflet-clickable");
  await page.hover(".leaflet-overlay-pane svg g:nth-child(2)");
  await page.waitForSelector(".leaflet-popup-content");
  let data = await page.evaluate(async () => {
    const result =
      document.querySelector(".leaflet-popup-content")?.textContent ||
      "No result was grabbed";
    return result;
  });

  console.log("Data after scraping");
  console.log(data);
}

main();
