import pandas as pd
import json

print("Loading Excel file...")
df_excel = pd.read_excel('Multifolk_product_sheet_rewritten_varied_updated.xlsx')

print("Loading products.json...")
with open('data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Create a mapping of skuid -> shape from Excel
shape_mapping = {}
for _, row in df_excel.iterrows():
    if pd.notna(row['skuid']) and pd.notna(row['shape']):
        shape_mapping[str(row['skuid']).strip()] = str(row['shape']).strip()

print(f"\nFound {len(shape_mapping)} products with shape data in Excel")

# Update products.json with shape data
updated_count =0
for product in products:
    skuid = str(product.get('skuid', '')).strip()
    if skuid in shape_mapping:
        product['shape'] = shape_mapping[skuid]
        updated_count += 1

print(f"Updated {updated_count} products in products.json with shape data")

# Save backup
print("\nCreating backup...")
with open('data/products_backup.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False,indent=2)

# Save updated products.json
print("Saving updated products.json...")
with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("\n✅ Done! Shape data has been merged into products.json")
print(f"   - Backup saved at: data/products_backup.json")
print(f"   - Updated {updated_count} products with shape information")
