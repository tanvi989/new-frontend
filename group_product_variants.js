import fs from 'fs';

// Read products
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

// Group products by base model (brand + style + size + shape)
const productGroups = {};

products.forEach(product => {
    // Create a unique key for the base model
    const baseKey = `${product.brand || ''}_${product.style || ''}_${product.size || ''}_${product.shape || ''}_${product.gender || ''}`.toLowerCase();

    if (!productGroups[baseKey]) {
        productGroups[baseKey] = {
            ...product,
            variants: [],
            all_colors: [],
            all_color_names: [],
            all_skuids: []
        };
    }

    // Add this product as a variant
    productGroups[baseKey].variants.push({
        skuid: product.skuid,
        color_names: product.color_names,
        colors: product.colors,
        image: product.image,
        images: product.images
    });

    // Aggregate colors
    if (product.colors) {
        productGroups[baseKey].all_colors.push(...product.colors);
    }
    if (product.color_names) {
        productGroups[baseKey].all_color_names.push(...product.color_names);
    }
    if (product.skuid) {
        productGroups[baseKey].all_skuids.push(product.skuid);
    }
});

// Convert back to array and deduplicate colors
const groupedProducts = Object.values(productGroups).map(group => {
    // Remove duplicates from aggregated colors
    group.all_colors = [...new Set(group.all_colors)];
    group.all_color_names = [...new Set(group.all_color_names)];

    // Update the main colors array to show all available colors
    group.colors = group.all_colors;
    group.color_names = group.all_color_names;

    return group;
});

console.log(`Original products: ${products.length}`);
console.log(`Grouped products: ${groupedProducts.length}`);
console.log(`Reduction: ${products.length - groupedProducts.length} products merged`);

// Show some examples
console.log('\n📊 Sample grouped products:');
groupedProducts.slice(0, 5).forEach(p => {
    console.log(`\n${p.brand} ${p.style} ${p.size}:`);
    console.log(`  - Variants: ${p.variants.length}`);
    console.log(`  - Colors: ${p.color_names.join(', ')}`);
    console.log(`  - SKUIDs: ${p.all_skuids.join(', ')}`);
});

// Save grouped products
fs.writeFileSync('./data/products_grouped.json', JSON.stringify(groupedProducts, null, 2));
console.log('\n✅ Saved to products_grouped.json');
