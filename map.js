$.map(brandBooths, (boothId) => {
  let map = _.find(boothsInthisTile, (map) => {
    return map.name === "Ada";
  });
  console.log("map is");
  console.log(map);
  return map.dimension;
});


$.map(brandBooths, (boothId) => {
    let map = _.find(boothsInthisTile, (map) => {
      return map.label.text === boothId;
    });

    return map.dimension;
  });
  
