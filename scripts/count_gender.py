import json

path = r'c:\Users\Admin\OneDrive - Softreey\Documents\Multifolks_Frontend\data\products.json'

try:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    men = 0
    women = 0
    unisex = 0
    other = 0

    for p in data:
        g = p.get('gender')
        if g == 'Men':
            men += 1
        elif g == 'Women':
            women += 1
        elif g == 'Unisex':
            unisex += 1
        else:
            other += 1

    print(f"Total: {len(data)}")
    print(f"Men: {men}")
    print(f"Women: {women}")
    print(f"Unisex: {unisex}")
    print(f"Other: {other}")

except Exception as e:
    print(e)
