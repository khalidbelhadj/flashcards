const fs = require("fs");
const { converter, formatHsl } = require("culori");

// Create converters
const toHsl = converter("hsl");

function colorToHSL(colorString) {
  try {
    // Parse the color using culori
    const hslColor = toHsl(colorString);

    if (!hslColor) {
      return colorString; // Return original if conversion fails
    }

    // Format HSL values
    const h = hslColor.h !== undefined ? Math.round(hslColor.h) : 0;
    const s = hslColor.s !== undefined ? Math.round(hslColor.s * 100) : 0;
    const l = hslColor.l !== undefined ? Math.round(hslColor.l * 100) : 0;

    return `hsl(${h}, ${s}%, ${l}%)`;
  } catch (error) {
    console.warn(`Warning: Could not convert "${colorString}":`, error.message);
    return colorString;
  }
}

function convertCSSToHSL(cssContent) {
  let result = cssContent;

  // Convert hex colors (#ffffff, #fff)
  result = result.replace(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g, (match) => {
    return colorToHSL(match);
  });

  // Convert oklch colors
  result = result.replace(/oklch\(([^)]+)\)/g, (match) => {
    return colorToHSL(match);
  });

  // Convert rgb/rgba colors
  result = result.replace(/rgba?\(([^)]+)\)/g, (match) => {
    return colorToHSL(match);
  });

  return result;
}

// Main execution
const inputFile = process.argv[2] || "input.css";
const outputFile = process.argv[3] || "output.css";

try {
  const cssContent = fs.readFileSync(inputFile, "utf8");
  const converted = convertCSSToHSL(cssContent);
  fs.writeFileSync(outputFile, converted, "utf8");

  console.log(`✅ Conversion complete!`);
  console.log(`   Input:  ${inputFile}`);
  console.log(`   Output: ${outputFile}`);
} catch (error) {
  console.error("❌ Error:", error.message);
  console.log("\nUsage: node convert-to-hsl.js <input.css> [output.css]");
  process.exit(1);
}
