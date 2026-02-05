import fs from 'fs';

// Read the products JSON file
const productsData = JSON.parse(fs.readFileSync('./data/products_backup.json', 'utf8'));

// Extract unique SKUID to color mappings
const colorMapping = {};

productsData.forEach(product => {
    const skuid = product.skuid;
    const colorNames = product.color_names;

    if (skuid && colorNames && colorNames.length > 0) {
        // Get last 4 digits of SKUID
        if (skuid.length >= 4) {
            const colorCode = skuid.slice(-4);
            const colorName = colorNames[0]; // Take first color name

            // Store the mapping (if multiple products have same code, keep first one)
            if (!colorMapping[colorCode]) {
                colorMapping[colorCode] = colorName;
            }
        }
    }
});

// Sort by color code
const sortedMapping = Object.keys(colorMapping)
    .sort()
    .reduce((obj, key) => {
        obj[key] = colorMapping[key];
        return obj;
    }, {});

// Print TypeScript format
console.log("export const FRAME_COLOR_MAP: Record<string, string> = {");
Object.entries(sortedMapping).forEach(([code, color]) => {
    console.log(`  "${code}": "${color}",`);
});
console.log("};");

console.log(`\n\n// Total unique color codes: ${Object.keys(sortedMapping).length}`);

// Save to file
fs.writeFileSync('./color_mapping_extracted.json', JSON.stringify(sortedMapping, null, 2));
console.log('Saved to: ./color_mapping_extracted.json');
