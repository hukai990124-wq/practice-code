var profile = {
    name: "HuKai",
    intro: "菴螂ｽ・∬ｿ呎弍謌醍噪荳ｪ莠ｺ邂莉九・",
    details: [
        ["蟷ｴ鮴・", "27"],
        ["蝗ｽ邀・", "荳ｭ蝗ｽ"],
        ["蟄ｦ蜴・", "譛ｬ遘・"],
        ["謇蝨ｨ蝨ｰ", "荳應ｺｬ"],
        ["蜈ｴ雜｣", "Blender縲、I縲∵ｸｸ謌・"]
    ]
};

var detailsHtml = profile.details.map(function (item) {
    return "<dt>" + item[0] + "</dt><dd>" + item[1] + "</dd>";
}).join("");

document.getElementById("profile").innerHTML =
    "<h1>" + profile.name + "</h1>" +
    '<p class="intro">' + profile.intro + "</p>" +
    "<dl>" + detailsHtml + "</dl>";
