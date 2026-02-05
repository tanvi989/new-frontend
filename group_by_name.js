import fs from 'fs';

// Read products
const products = JSON.parse(fs.readFileSync('./data/products_ungrouped.json', 'utf8'));

// Group products by name (which should be the model identifier)
const productGroups = {};

products.forEach(product => {
    // Use the name as the primary grouping key
    const baseKey = `${product.name || ''}_${product.brand || ''}_${product.style || ''}_${product.size || ''}`.toLowerCase().trim();

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

// Show distribution of variant counts
const variantCounts = {};
groupedProducts.forEach(p => {
    const count = p.variants.length;
    variantCounts[count] = (variantCounts[count] || 0) + 1;
});

console.log('\n📊 Variant distribution:');
Object.entries(variantCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([count, num]) => {
    console.log(`  ${count} variant(s): ${num} products`);
});

// Show some examples with different variant counts
console.log('\n📋 Sample products:');
[1, 2, 3, 4, 5].forEach(targetCount => {
    const example = groupedProducts.find(p => p.variants.length === targetCount);
    if (example) {
        console.log(`\n${example.name} (${example.variants.length} variants):`);
        console.log(`  Colors: ${example.color_names.join(', ')}`);
        console.log(`  SKUIDs: ${example.all_skuids.join(', ')}`);
    }
});

// Save grouped products
fs.writeFileSync('./data/products_grouped_by_name.json', JSON.stringify(groupedProducts, null, 2));
console.log('\n✅ Saved to products_grouped_by_name.json');
