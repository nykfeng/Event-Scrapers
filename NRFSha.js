var $ = jQuery;
var results = [];
var isLoadCompleted = false;

function injectUnderscore() {
  var tag = document.createElement("script");
  tag.src =
    "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js";
  tag.type = "text/javascript";
  tag.onload = processBrands;
  document.body.appendChild(tag);
}

function processBrands() {
  results = $.map($(".view-exhibitors table.views-table tbody tr"), (row) => {
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
      brandInfoPagePromise: $.get(brandPageUrl).done((response) => {
        $.extend(brand, { brandInfoPageHtml: response });
        parseBrandInfo(brand);
      }),
    };

    return brand;
  });

  $.when(..._.pluck(results, "brandInfoPagePromise")).done(() => {
    console.log("result obtained");

    buildDomElements();

    console.log("dom elements are built");
    isLoadCompleted = true;
  });
}

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

injectUnderscore();
