// Color name to hex code mapping for visual display
export const COLOR_NAME_TO_HEX: Record<string, string> = {
    // Blacks and Greys
    "Black": "#000000",
    "Black & Gold": "linear-gradient(135deg, #000000 0%, #FFD700 100%)",
    "Black Transparent": "rgba(0, 0, 0, 0.3)",
    "Gun": "#4A4A4A",
    "Gunmetal": "#2C3539",
    "Grey": "#808080",
    "Grey Transparent": "rgba(128, 128, 128, 0.3)",
    "Charcoal": "#36454F",
    "Silver": "#C0C0C0",
    "Dark brown": "#3E2723",
    "Matte": "#D3D3D3",

    // Browns
    "Brown": "#8B4513",
    "Reddish brown": "#A0522D",
    "Tortoise": "#8B4513",

    // Blues
    "Blue": "#0066CC",
    "Royal Blue": "#4169E1",
    "Blue Transparent": "#87CEEB",
    "Navy Blue": "#000080",
    "Teal": "#008080",

    // Reds and Burgundy
    "Red": "#DC143C",
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
    "White Transparent": "rgba(255, 255, 255, 0.3)",
    "Transparent": "#FFFFFF",
    "Cream": "#FFFDD0",

    // Others
    "Green": "#228B22",
    "Olive": "#808000",
    "Mint": "#98FF98",
    "Purple": "#800080",
    "Mauve": "#E0B0FF",
    "Pink": "#FFC0CB",
    "Peach": "#FFE5B4",
    "Orange": "#FF8C00",
    "Yellow": "#FFFF00",
    "Beige": "#F5F5DC",
    "Multicolor": "#FF69B4",
    "Multi": "linear-gradient(90deg, #FF0000 0%, #00FF00 33%, #0000FF 66%, #FFFF00 100%)",
    "Black and gold": "#000000",
};

/**
 * Get hex color code from color name
 * @param colorName - Color name from product data
 * @returns Hex color code, gradient, or passed-through value if valid
 */
export const getHexFromColorName = (colorName: string): string => {
    if (!colorName) return "#000000";

    // Direct match in map
    if (COLOR_NAME_TO_HEX[colorName]) return COLOR_NAME_TO_HEX[colorName];

    // Case-insensitive match
    const lowerName = colorName.toLowerCase();
    const foundKey = Object.keys(COLOR_NAME_TO_HEX).find(key => key.toLowerCase() === lowerName);
    if (foundKey) return COLOR_NAME_TO_HEX[foundKey];

    // If it looks like a CSS color value (hex, rgb, rgba, linear-gradient), return it as is
    if (
        colorName.startsWith("#") ||
        colorName.startsWith("rgb") ||
        colorName.startsWith("hsl") ||
        colorName.startsWith("linear-gradient")
    ) {
        return colorName;
    }

    // Fallback
    return "#000000";
};

/**
 * Get hex colors array from color names array
 * @param colorNames - Array of color names
 * @returns Array of hex color codes
 */
export const getHexColorsFromNames = (colorNames: string[]): string[] => {
    if (!colorNames || colorNames.length === 0) {
        return ["#000000"];
    }
    return colorNames.map(name => getHexFromColorName(name));
};
