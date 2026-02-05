
import pandas as pd
import os

file_path = r'c:\Users\Admin\Downloads\ga_new-main (1)\ga_new-main\Multifolk_product_sheet_rewritten_varied_updated.xlsx'

try:
    df = pd.read_excel(file_path)
    with open('excel_output.txt', 'w') as f:
        f.write(f"Columns: {df.columns.tolist()}\n")
        f.write(f"First row: {df.iloc[0].to_dict()}\n")
except Exception as e:
    print(f"Error reading excel: {e}")
