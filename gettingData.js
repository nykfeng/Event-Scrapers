const axios = require("axios");

(async () => {
  let result;
  axios(
    "https://img14.a2zinc.net/api/exhibitor?mapId=119&eventId=167&appId=VEANgX18thjf0ErIFC5hDuFEAu9oy033HnuyF7j4IFnEursxdYEROXEzR7yFZCmI&floorplanViewType=VIEW4&langId=1&boothId=&shMode=&minLblSize=2&maxLblSize=10&minCnSize=2&maxCnSize=11&_=1668990068399"
  ).then((data) => {
    result = JSON.parse(data.data);
    result.forEach((r) => {
      console.log(r);
    });
  });
})();
