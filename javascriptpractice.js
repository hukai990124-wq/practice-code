var profile = {
    name: "HuKai",
    intro: "A person from China, and studying code now.",
    details: [Age;27,location;Tokyo,Language;Chinese,English,Japanese]
    

var detailsHtml = profile.details.map(function (item) {
    return "<dt>" + item[0] + "</dt><dd>" + item[1] + "</dd>";
}).join("");

document.getElementById("profile").innerHTML =
    "<h1>" + profile.name + "</h1>" +
    '<p class="intro">' + profile.intro + "</p>" +
    "<dl>" + detailsHtml + "</dl>";
