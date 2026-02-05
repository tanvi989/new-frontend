import fs from 'fs';

// Read the extracted color mapping
const colorMapping = JSON.parse(fs.readFileSync('./color_mapping_extracted.json', 'utf8'));

// Generate TypeScript file
const tsContent = `// Color code mapping for frame colors
// Last 4 digits of SKUID represent the color code
// Auto-generated from product data - ${Object.keys(colorMapping).length} unique color codes

export const FRAME_COLOR_MAP: Record<string, string> = {
${Object.entries(colorMapping).map(([code, color]) => `  "${code}": "${color}",`).join('\n')}
};

/**
 * Extract color from SKUID based on last 4 digits
 * @param skuid - Product SKUID (string or number)
 * @returns Color name or formatted code if not found
 */
export const getColorFromSkuid = (skuid: string | number | undefined): string => {
    if (!skuid) {
        return "Unknown";
    }
    
    const skuidStr = String(skuid);
    if (skuidStr.length < 4) {
        return "Unknown";
    }

    const colorCode = skuidStr.slice(-4);
    return FRAME_COLOR_MAP[colorCode] || \`Color-\${colorCode}\`;
};

/**
 * Get all available colors
 * @returns Array of all color names
 */
export const getAllColors = (): string[] => {
    return Array.from(new Set(Object.values(FRAME_COLOR_MAP)));
};

/**
 * Get color code from SKUID
 * @param skuid - Product SKUID (string or number)
 * @returns Last 4 digits color code
 */
export const getColorCode = (skuid: string | number | undefined): string => {
    if (!skuid) {
        return "";
    }
    
    const skuidStr = String(skuid);
    if (skuidStr.length < 4) {
        return "";
    }
    return skuidStr.slice(-4);
};
`;

// Generate Python file
const pyContent = `# Color code mapping for frame colors
# Last 4 digits of SKUID represent the color code
# Auto-generated from product data - ${Object.keys(colorMapping).length} unique color codes

FRAME_COLOR_MAP = {
${Object.entries(colorMapping).map(([code, color]) => `    "${code}": "${color}",`).join('\n')}
}

def get_color_from_skuid(skuid):
    """
    Extract color from SKUID based on last 4 digits
    
    Args:
        skuid: Product SKUID (string or int)
        
    Returns:
        Color name or formatted code if not found
    """
    if not skuid:
        return "Unknown"
    
    skuid_str = str(skuid)
    if len(skuid_str) < 4:
        return "Unknown"
    
    color_code = skuid_str[-4:]
    return FRAME_COLOR_MAP.get(color_code, f"Color-{color_code}")
`;

// Write files
fs.writeFileSync('./utils/colorMapping.ts', tsContent);
fs.writeFileSync('../login_api/color_mapping.py', pyContent);

console.log('✅ Updated colorMapping.ts with', Object.keys(colorMapping).length, 'color codes');
console.log('✅ Updated color_mapping.py with', Object.keys(colorMapping).length, 'color codes');
