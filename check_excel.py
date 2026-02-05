import pandas as pd
import json

# Read the Excel file
df = pd.read_excel('Multifolk_product_sheet_rewritten_varied_updated.xlsx')

print("=" * 80)
print("EXCEL FILE ANALYSIS")
print("=" * 80)
print(f"\nTotal rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")

print("\n" + "=" * 80)
print("ALL COLUMNS:")
print("=" * 80)
for i, col in enumerate(df.columns, 1):
    print(f"{i:2d}. {col}")

print("\n" + "=" * 80)
print("CHECKING FOR SHAPE COLUMN:")
print("=" * 80)
shape_cols = [col for col in df.columns if 'shape' in col.lower()]
if shape_cols:
    print(f"Found shape-related columns: {shape_cols}")
    for col in shape_cols:
        print(f"\nUnique values in '{col}':")
        print(df[col].value_counts().head(20))
else:
    print("No 'shape' column found")

print("\n" + "=" * 80)
print("FIRST 3 ROWS (sample data):")
print("=" * 80)
print(df.head(3).to_string())
