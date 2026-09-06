const fs = require('fs');
const code = fs.readFileSync('src/components/ui/particle-wordmark.tsx', 'utf8');

const sourceMatch = code.match(/const epiludeFooterSource = `([\s\S]*?)`;/);
if (sourceMatch) {
  const src = sourceMatch[1];
  console.log("Found source!");
  
  const targetRegex = /var WORDMARK =[\s\S]*?['"]<\/svg>['"];/;
  const replaced = src.replace(targetRegex, "!!!MATCH!!!");
  
  if (replaced.includes("!!!MATCH!!!")) {
    console.log("Regex successfully replaced.");
  } else {
    console.log("Regex failed to match.");
    // Print the exact block around var WORDMARK
    const blockMatch = src.match(/var WORDMARK =[\s\S]{0,200}/);
    console.log("Block:", blockMatch ? blockMatch[0] : "Not found at all");
  }
} else {
  console.log("Source not found");
}
