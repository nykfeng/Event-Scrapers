const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const axios = require("axios");
const _ = require("underscore");

$input = {};
$input["mapData"] = [];

let counter = 0;

var results = [];
var isLoadCompleted = false;

console.log($input.mapData);

const exhibitorListUrl = "https://nrfbigshow.nrf.com/exhibitors";
let exhibitorListUrlDOM;


console.log("Setting for ajax request");

const getData = async (url) => {
  const response = await axios.get(url);
  console.log("response.data size is ", response.data.length);
  return response.data;
};

(async () => {
  let mapIds = [119, 120, 124, 129];
  for (let i = 0; i < mapIds.length; i++) {
    let url = `https://img14.a2zinc.net/api/exhibitor?mapId=${mapIds[i]}&eventId=167&appId=VEANgX18thjf0ErIFC5hDuFEAu9oy033HnuyF7j4IFnEursxdYEROXEzR7yFZCmI&floorplanViewType=View4&langId=1&boothId=&shMode=E&minLblSize=2&maxLblSize=10&minCnSize=2&maxCnSize=11&_=1670897680974`;

    // axios.get(url).then(function (response) {
    //   console.log("response.data size is ", response.data.length);
    //   $input.mapData.push(...response.data);
    // });

    $input.mapData.push(...(await getData(url)));
  }

  console.log("We got exhibitor booth info");
  console.log("input.mapData size is ", $input.mapData.length);

  exhibitorListUrlDOM = await getData(exhibitorListUrl);

  console.log("We got exhibitor list DOM");

  await processBrands();

  console.log("Now results's size is ", results.length);

  await visitingBrandPageUrl();

  console.log("Finished loading brand info");
})();

function displayBrandInfo(brand) {
  for (info in brand) {
    console.log(info + ": " + brand[info]);
  }
}

async function visitingBrandPageUrl() {
  for (let brand of results) {
    // console.log("brand url is: ", brand.brandUrl);
    brand.brandUrl = "https://nrfbigshow.nrf.com" + brand.brandUrl;
    // console.log("brand url is: ", brand.brandUrl);
    brand.brandInfoPageHtml = await getData(brand.brandUrl);
    counter++;
    console.log("counter: ", counter);
    console.log("======================================================");
    parseBrandInfo(brand);
    brand.brandInfoPageHtml = "";
    displayBrandInfo(brand);
    if (counter === 20) break;
  }
}

async function processBrands() {
  console.log("Start processing brands");
  results = $.map(
    $(".view-exhibitors table.views-table tbody tr", exhibitorListUrlDOM),
    (row) => {
      let brandBooths = $.map($("td:eq(1)", row).text().split(","), (x) =>
        x.trim()
      );

      let brandPageUrl = $("td:eq(0) a", row).attr("href");

      let isSponsorOnly = _.every(
        brandBooths,
        (boothId) => boothId.toLowerCase() === "sponsor only"
      );
      let brand = {
        brandUrl: brandPageUrl,
        brandName: $("td:eq(0) a", row).text(),
        boothIds: isSponsorOnly ? [] : brandBooths,
        isSponsorOnly: isSponsorOnly,
        boothSizes: $.map(brandBooths, (boothId) => {
          let map = _.find($input.mapData, (map) => {
            return map.label.text === boothId;
          });
          return map.dimension;
        }),

      };
      return brand;
    }
  );

  //   $.when(..._.pluck(results, "brandInfoPagePromise")).done(() => {
  //     console.log("result obtained");

  //     // buildDomElements();

  //     console.log("dom elements are built");
  //     isLoadCompleted = true;
  //   });
}

// processBrands();

function parseBrandInfo(brand) {
  $.extend(brand, {
    websiteUrl:
      $(".company_website a", brand.brandInfoPageHtml).attr("href") || "",
    description: "".concat(
      ...$(".views-field-body p", brand.brandInfoPageHtml).text().trim()
    ),
    categories:
      $(
        ".views-field-field-ref-product-category .field-content",
        brand.brandInfoPageHtml
      )
        .text()
        .split(",") || [],
    logoUrl: $(".company_logo img", brand.brandInfoPageHtml).attr("src") || "",
    contactCityState:
      $(".company_contact_city_state", brand.brandInfoPageHtml).text() || "",
    contactCountry: $(".company_country", brand.brandInfoPageHtml).text() || "",
    sponsorType:
      $(
        ".views-field-field-sponsor-level .field-content",
        brand.brandInfoPageHtml
      )
        .text()
        .replace(/\s*[sS]+ponsor/g, "") || "",
  });
}

function buildDomElements() {
  console.log("Start build data to DOM");
  _.each(results, (brand) => {
    $("<div>", {
      class: "brand-scrap-item",
      "brand-url": brand.brandUrl,
      "brand-name": brand.brandName,
      "brand-booths": brand.isSponsorOnly ? "" : brand.boothIds.join(";"),
      "brand-booth-sizes": brand.isSponsorOnly
        ? ""
        : brand.boothSizes.join(";"),
      "brand-sponsor-type": brand.sponsorType,
      "brand-website": brand.websiteUrl,
      "brand-description": brand.description,
      "brand-categories": brand.categories.map((cat) => cat.trim()).join(";"),
      "brand-logo-url": brand.logoUrl,
      "brand-is-exhibitor": !brand.isSponsorOnly,
      "brand-is-sponsor": brand.isSponsorOnly || brand.sponsorType.length > 0,
    })
      .text(brand.contactCityState || "" + brand.contactCountry || "")
      .appendTo(document.body);
  });
}
