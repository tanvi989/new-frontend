import pandas as pd

df = pd.read_excel('Multifolk_product_sheet_rewritten_varied_updated.xlsx')

with open('columns_list.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total rows: {len(df)}\n")
    f.write(f"Total columns: {len(df.columns)}\n\n")
    f.write("COLUMNS:\n")
    for i, col in enumerate(df.columns, 1):
        f.write(f"{i}. {col}\n")
    
    # Check for shape column
    f.write("\n\nCHECKING FOR SHAPE:\n")
    if 'shape' in df.columns:
        f.write("Shape column found!\n")
        f.write(f"\nUnique shapes: {df['shape'].nunique()}\n")
        f.write("\nShape values:\n")
        for val, count in df['shape'].value_counts().items():
            f.write(f"  - {val}: {count} products\n")

print("Done! Check columns_list.txt")
