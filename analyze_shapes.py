import pandas as pd
import json

# Read Excel file
df = pd.read_excel('Multifolk_product_sheet_rewritten_varied_updated.xlsx')

# Show all unique shapes
print("="*60)
print("SHAPE DATA IN EXCEL:")
print("="*60)
print(f"\nTotal products: {len(df)}")
print(f"Products with shape data: {df['shape'].notna().sum()}")
print(f"\nUnique shapes ({df['shape'].nunique()}):")
print(df['shape'].value_counts())

# Save to file for reference
with open('shape_data_summary.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total products: {len(df)}\n")
    f.write(f"Products with shape data: {df['shape'].notna().sum()}\n\n")
    f.write("Shape distribution:\n")
    for shape, count in df['shape'].value_counts().items():
        f.write(f"  - {shape}: {count}\n")

print("\nSaved to shape_data_summary.txt")
