import json
import random

path = r'c:\Users\Admin\OneDrive - Softreey\Documents\Multifolks_Frontend\data\products.json'

try:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    new_products = []
    max_id = max(p['id'] for p in data)

    women_products = [p for p in data if p.get('gender') == 'Women']
    
    # Duplicate them to add more data
    for p in women_products:
        new_p = p.copy()
        max_id += 1
        new_p['id'] = max_id
        new_p['skuid'] = f"{p['skuid']}_DUP_{random.randint(100,999)}"
        new_products.append(new_p)

    data.extend(new_products)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    print(f"Added {len(new_products)} new Women products. Total: {len(data)}")

except Exception as e:
    print(e)
