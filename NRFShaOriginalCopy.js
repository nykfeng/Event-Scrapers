var $ = jQuery;
var results = [];
var isLoadCompleted = false;

function injectUnderscore() {
    var tag = document.createElement('script');
    tag.src = 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js';
    tag.type = 'text/javascript';
    tag.onload = processBrands;
    document.body.appendChild(tag);
}

function isValidUrl(url) {
    let trimmedUrl = url && url.length ? url.trim() : "";
    let matches = trimmedUrl.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);
    return matches && matches.length > 0;
}

function testImageIsValid(url) {
    if (isValidUrl(url)) {
        return new Promise((resolve, reject) => {
            var timer, img = new Image();

            function clear() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }

            img.onerror = img.onabort = function () {
                console.log("Image error/abort: " + url);
                clear(timer);
                reject("error");
            };
            img.onload = function () {
                //console.log("Image loaded: " + url);
                clear(timer);
                resolve("success");
            };

            timer = setTimeout(function () {
                console.log("Image load timeout: " + url);
                img.src = "//!//";
                reject("timeout");
            }, 5000);

            img.src = url;
            //console.log("Image start: " + url);
        });
    } 
    return Promise.reject(TypeError("Image Url is bad:" + url || "<null>"));
}

function processBrands() {

    results = $.map($(".view-Exhibitor-List table.views-table tbody tr"), row => {
        let brandBooths = $.map($("td:eq(1)", row).text().split(","), x => x.trim());
        let brandPageUrl = window.location.origin + $("td:eq(0) a", row).attr("href");
        let isSponsorOnly = _.every(brandBooths, boothId => boothId.toLowerCase() === "sponsor only");
        let brand = {
            brandUrl: brandPageUrl,
            brandName: $("td:eq(0) a", row).text(),
            boothIds: isSponsorOnly ? [] : brandBooths,
            isSponsorOnly: isSponsorOnly,
            boothSizes: $.map(brandBooths, boothId => {
                let boothSelector = "[BoothLabel='" + boothId + "']";
                let map = _.find($input.mapData,
                    map => {
                        return $(boothSelector, map).length > 0;
                    });
                return $(boothSelector, map).attr("BoothSize");
            }),
            brandInfoPagePromise: $.get(brandPageUrl).done(response => {
                $.extend(brand, { brandInfoPageHtml: response });
                parseBrandInfo(brand);
                brand.validatorPromise = testImageIsValid(brand.logoUrl).catch(i => brand.logoUrl = "");
            })
        };

        return brand;
    });

    $.when(..._.pluck(results, "brandInfoPagePromise")).done(i => {
        var imgPromises = results.map(i => i.validatorPromise);
        console.log("Image start load: " + imgPromises.length);
        $.when(...imgPromises).done(i => {
            buildDomElements();
            isLoadCompleted = true;
            console.log("Promises loaded");
        });
    });
}

function parseBrandInfo(brand) {
    $.extend(brand,
        {
            websiteUrl: $(".company_website a", brand.brandInfoPageHtml).attr("href"),
            description: "".concat(...$(".views-field-body p", brand.brandInfoPageHtml).text().trim()),
            categories: $(".views-field-term-node-tid .field-content", brand.brandInfoPageHtml).text().split(","),
            logoUrl: $(".company_logo img", brand.brandInfoPageHtml).attr("src"),
            contactCityState: $(".company_contact_city_state", brand.brandInfoPageHtml).text(),
            contactCountry: $(".company_country", brand.brandInfoPageHtml).text(),
            sponsorType: $(".booth_sponsoring_label", brand.brandInfoPageHtml).text().replace(/\s*[sS]+ponsor/g, "")
        });
}

function buildDomElements() {
    _.each(results,
        brand => {
            $("<div>",
                {
                    "class": "brand-scrap-item",
                    "brand-url": brand.brandUrl,
                    "brand-name": brand.brandName,
                    "brand-booths": brand.isSponsorOnly ? "" : brand.boothIds.join(";"),
                    "brand-booth-sizes": brand.isSponsorOnly ? "" : brand.boothSizes.join(";"),
                    "brand-sponsor-type": brand.sponsorType,
                    "brand-website": brand.websiteUrl,
                    "brand-description": brand.description,
                    "brand-categories": _.each(brand.categories, cat => cat.trim()).join(";"),
                    "brand-logo-url": brand.logoUrl,
                    "brand-is-exhibitor": !brand.isSponsorOnly,
                    "brand-is-sponsor": brand.isSponsorOnly || brand.sponsorType.length > 0
                }).text(brand.contactCityState || "" + brand.contactCountry || "")
                .appendTo(document.body);
        });
}

injectUnderscore();