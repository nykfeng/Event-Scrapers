function processsExhibitorsAndLoadBooths() {
  function getDomain() {
    var match = window.location.host.match(/^\s*([a-zA-Z0-9]+)/);
    return match[0];
  }

  function buildLogoImageUrl(img) {
    var domain = getDomain();
    return window.location.origin + "/mys_shared/" + domain + "/logos/" + img;
  }

  function buildEventBrandUrl(exhId) {
    return (
      window.location.origin +
      "/8_0/exhibitor/exhibitor-details.cfm?exhid=" +
      exhId
    );
  }

  window.exhibitors = _.chain(window.rawExhibitors)
    .filter(
      (info) =>
        !_.isUndefined(info.fields.exhname_t) &&
        info.fields.exhname_t.toString().charAt(0) != "*"
    ) // exclude exhibitors which have '*' character in start of name(seems like they are not real exhibitors)
    .filter(
      (info) =>
        !window.pavilionExhibitors.length ||
        window.pavilionExhibitors.includes(info.fields.exhname_t)
    )
    .groupBy((info) => info.fields.exhid_l.toString())
    .map(function (info, exhId) {
      var item = _.first(info);
      return {
        exhId: exhId,
        boothLocation: "",
        boothSize: "",
        brandName: item.fields.exhname_t.toString(), // it's a fake brandName just use it for sorting
        description: item.fields.exhdesc_t ? item.fields.exhdesc_t : null,
        logoUrl: item.fields.exhlogo_t
          ? buildLogoImageUrl(item.fields.exhlogo_t)
          : null,
        eventBrandUrl: buildEventBrandUrl(exhId),
      };
    })
    .sortBy((info) => info.brandName.toLowerCase())
    .value();

  var boothResults = [];
  const boothInfoUrl =
    window.location.origin +
    "/8_0/exhview/exh-remote-proxy.cfm?action=getExhViewBoothResults&availableonly=false&orsearchtype0=exhibitor&orsearchcount=1&orsearchvalue0=";
  var promises = $.map(window.exhibitors, (q) =>
    $.get(boothInfoUrl + q.exhId).done((i) => {
      boothResults = boothResults.concat(i);
    })
  );

  $.when(...promises).done((q) => {
    _.chain(window.exhibitors)
      .each((info) => {
        var boothInfos = _.chain(boothResults)
          .filter((q) => q.boothstatus == "Reserved" && q.exhid == info.exhId)
          .sortBy((q) => q.booth)
          .value();
        if (boothInfos.length) {
          $.extend(info, {
            boothLocation: _.pluck(boothInfos, "boothdisplay").join(";"),
            boothSize: _.chain(boothInfos)
              .map((q) => {
                var pattern = /[\d|`|']+\s*x\s*[\d|`|']+/g;
                if (pattern.test(q.boothdims)) {
                  return q.boothdims; // + " - " + q.boothtypedisplay.replace(pattern, "").trim();
                } else {
                  return q.boothdims + " sq. ft.";
                }
              })
              .value()
              .join(";"),
          });
        }
      })
      .value();
    window.allAjaxDone = true;
  });
}
window.allAjaxDone = false;
processsExhibitorsAndLoadBooths();

console.log("test");
