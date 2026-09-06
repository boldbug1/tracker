const fs = require('fs');

const DAILYS_WORDMARK_SVG = `<svg width="1600" height="300" viewBox="0 0 1600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="800" y="235" text-anchor="middle" fill="#F4F4F0" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="240" font-weight="900" letter-spacing="-8">DAILYS</text>
</svg>`;

const epiludeFooterSource = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Epilude — Footer</title>
<style>
  .storm {
    position: relative;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 8.541554959785524;
  }
</style>
</head>
<body>
<div id="storm"><canvas id="storm-canvas"></canvas></div>
<script>
(function () {
  var WORDMARK =
    '<svg width="3186" height="373" viewBox="0 0 3186 373" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '</svg>';
  console.log("WORDMARK is", WORDMARK);
})();
</script>
</body>
</html>`;

const palette = "[[8, 10, 15], [40, 48, 62], [85, 96, 116]]";
const replaced = epiludeFooterSource
    .replace(
      "<title>Epilude — Footer</title>",
      "<title>Dailys Particle Wordmark</title>",
    )
    .replace(
      "aspect-ratio: 8.541554959785524;",
      "aspect-ratio: 5.333333333333333;",
    )
    .replace(
      /var WORDMARK =[\s\S]*?['"]<\/svg>['"];/,
      `var WORDMARK = ${JSON.stringify(DAILYS_WORDMARK_SVG)};`,
    );

console.log(replaced);
