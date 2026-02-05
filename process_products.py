
import pandas as pd
import os
import shutil
import json

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Define paths relative to the script directory
# Excel is in ../Multifolks_Backend/
excel_path = os.path.abspath(os.path.join(script_dir, '..', 'Multifolks_Backend', 'Multifolk_product_sheet_rewritten_varied_updated.xlsx'))

# Images source: ./Spexmojo_images/Spexmojo_images/
images_src_dir = os.path.join(script_dir, 'Spexmojo_images', 'Spexmojo_images')

# Destination: ./public/images/products/
images_dest_dir = os.path.join(script_dir, 'public', 'images', 'products')

# Output JSON: ./src/data/products.json
output_json_path = os.path.join(script_dir, 'src', 'data', 'products.json')

def process_products():
    print(f"Reading Excel from: {excel_path}")
    try:
        df = pd.read_excel(excel_path)
    except Exception as e:
        print(f"Error reading excel: {e}")
        return

    products = []
    
    # Ensure destination directory exists
    os.makedirs(images_dest_dir, exist_ok=True)

    print(f"Processing images from: {images_src_dir}")
    print(f"Saving images to: {images_dest_dir}")

    for index, row in df.iterrows():
        skuid = str(row.get('skuid', '')).strip()
        if not skuid:
            continue
            
        # Check if image folder exists
        src_folder = os.path.join(images_src_dir, skuid)
        
        product_images = []
        
        if os.path.exists(src_folder) and os.path.isdir(src_folder):
            # Look for images 1 to 4
            for i in range(1, 5):
                image_name = f"{skuid}_{i}.jpg"
                src_image = os.path.join(src_folder, image_name)
                
                if os.path.exists(src_image):
                    # Copy image
                    dest_image = os.path.join(images_dest_dir, image_name)
                    try:
                        shutil.copy2(src_image, dest_image)
                        product_images.append(f"/images/products/{image_name}")
                    except Exception as e:
                        print(f"Error copying image {image_name}: {e}")
                else:
                    # print(f"Image {image_name} not found")
                    pass
        
        # If no images found, maybe try finding skuid.jpg? (Optional, based on previous logic)
        # The previous logic only looked for skuid_1.jpg.
        
        # Create product object
        if product_images:
             primary_image = product_images[0]
        else:
             primary_image = "" # Or a placeholder

        product = {
            "id": row.get('id'),
            "name": row.get('name') or f"{row.get('brand', '')} {row.get('style', '')}",
            "brand": row.get('brand'),
            "style": row.get('style'),
            "size": row.get('size'),
            "price": row.get('price'),
            "colors": ["#000000"], # Default hex
            "color_names": [row.get('framecolor')],
            "image": primary_image,
            "images": product_images,
            "skuid": skuid,
            "category": row.get('primarycategory'),
            "material": row.get('material'),
            "collections": [row.get('secondarycategory')] if row.get('secondarycategory') else [],
            "comfort": str(row.get('comfort', '')).split(',') if row.get('comfort') else [],
            "gender": row.get('gender')
        }
        
        # Only add if we have at least one image? Or add all?
        # Previous logic only added if skuid_1.jpg existed.
        if product_images:
            products.append(product)

    print(f"Processed {len(products)} products.")
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    
    with open(output_json_path, 'w') as f:
        json.dump(products, f, indent=2)
    print(f"Saved to {output_json_path}")

if __name__ == "__main__":
    process_products()
