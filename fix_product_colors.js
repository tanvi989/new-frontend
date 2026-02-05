import fs from 'fs';

// Color name to hex mapping
const COLOR_NAME_TO_HEX = {
    // Blacks and Greys
    "Black": "#000000",
    "Gun": "#4A4A4A",
    "Gunmetal": "#2C3539",
    "Grey": "#808080",
    "Grey transparent": "#B0B0B0",
    "Charcoal": "#36454F",
    "Silver": "#C0C0C0",
    "Dark brown": "#3E2723",

    // Browns
    "Brown": "#8B4513",
    "Reddish brown": "#A0522D",
    "Tortoise": "#8B4513",

    // Blues
    "Blue": "#0000FF",
    "Royal blue": "#4169E1",
    "Blue transparent": "#87CEEB",
    "Navy Blue": "#000080",
    "Teal": "#008080",

    // Reds and Burgundy
    "Red": "#FF0000",
    "Burgundy": "#800020",
    "Wine": "#722F37",
    "Maroon": "#800000",

    // Golds and Metallics
    "Gold": "#FFD700",
    "Golden": "#FFD700",
    "Rose Gold": "#B76E79",
    "Copper": "#B87333",
    "Bronze": "#CD7F32",

    // Whites and Creams
    "White": "#FFFFFF",
    "White transparent": "#F5F5F5",
    "Cream": "#FFFDD0",

    // Others
    "Green": "#008000",
    "Olive": "#808000",
    "Mint": "#98FF98",
    "Purple": "#800080",
    "Pink": "#FFC0CB",
    "Peach": "#FFE5B4",
    "Orange": "#FFA500",
    "Yellow": "#FFFF00",
    "Beige": "#F5F5DC",
    "Multicolor": "#FF69B4",
    "Black and gold": "#000000",
};

// Read products
const products = JSON.parse(fs.readFileSync('./data/products_backup.json', 'utf8'));

let updatedCount = 0;

// Update each product
products.forEach(product => {
    if (product.color_names && product.color_names.length > 0) {
        // Convert color names to hex codes
        const hexColors = product.color_names.map(colorName => {
            return COLOR_NAME_TO_HEX[colorName] || "#000000";
        });

        // Update the colors array
        product.colors = hexColors;
        updatedCount++;
    }
});

// Save updated products
fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
fs.writeFileSync('./data/products_backup.json', JSON.stringify(products, null, 2));

console.log(`✅ Updated ${updatedCount} products with correct hex colors`);
console.log(`📝 Saved to products.json and products_backup.json`);
