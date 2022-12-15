//load the page then move data into my object
window.dexiBoothsInthisTile = boothsInthisTile.slice();
window.clickTimeout = false;
//click wait for load then add additional into my array find all anchor tags with 'ABM' 
const allTags = window.document.querySelectorAll('[data-boothlabels^="ABM"]');

// pick one click it. 
let anchorTag = allTags[0];
if (!anchorTag) {
    window.clickTimeout = true;
    return;
}
anchorTag.click();

let myTime = setTimeout(() => {
    let copyOfBooths = boothsInthisTile.slice();
    
    window.dexiBoothsInthisTile = window.dexiBoothsInthisTile.concat(copyOfBooths);
   
    window.clickTimeout = true;
}, 7000);