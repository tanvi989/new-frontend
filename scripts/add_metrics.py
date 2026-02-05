import json
import random
import os

path = r'c:\Users\Admin\OneDrive - Softreey\Documents\Multifolks_Frontend\data\products.json'

if not os.path.exists(path):
    print(f"File not found: {path}")
    exit(1)

try:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for product in data:
        # Generate varied data to simulate real usage
        clicks = random.randint(100, 2000)
        adds = random.randint(10, int(clicks * 0.3)) # Adds are usually a subset of clicks
        
        product['clicks'] = clicks
        product['adds_to_cart'] = adds
        
        # Remove old generic popularity if it exists, to be clean
        if 'popularity' in product:
            del product['popularity']

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    print("Updated products.json with clicks and adds_to_cart")
except Exception as e:
    print(f"Error: {e}")
