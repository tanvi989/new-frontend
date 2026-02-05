import pandas as pd
import json

# Read the Excel file
excel_file = '/home/selfeey-india/Documents/AI_Projects/Multifolks_Frontend/Multifolk_product_sheet_rewritten_varied_updated.xlsx'
df = pd.read_excel(excel_file)

# Extract unique SKUID to framecolor mappings
color_mapping = {}

for index, row in df.iterrows():
    skuid = str(row.get('skuid', '')).strip()
    framecolor = str(row.get('framecolor', '')).strip()
    
    if skuid and framecolor and framecolor != 'nan':
        # Get last 4 digits of SKUID
        if len(skuid) >= 4:
            color_code = skuid[-4:]
            # Store the mapping (if multiple products have same code, keep first one)
            if color_code not in color_mapping:
                color_mapping[color_code] = framecolor

# Sort by color code for better readability
sorted_mapping = dict(sorted(color_mapping.items()))

# Print the mapping in TypeScript format
print("export const FRAME_COLOR_MAP: Record<string, string> = {")
for code, color in sorted_mapping.items():
    print(f'  "{code}": "{color}",')
print("};")

print("\n\n// Python dictionary format:")
print("FRAME_COLOR_MAP = {")
for code, color in sorted_mapping.items():
    print(f'  "{code}": "{color}",')
print("}")

# Also save to JSON file
with open('/tmp/color_mapping.json', 'w') as f:
    json.dump(sorted_mapping, f, indent=2)

print(f"\n\nTotal unique color codes: {len(sorted_mapping)}")
print(f"Saved to: /tmp/color_mapping.json")
