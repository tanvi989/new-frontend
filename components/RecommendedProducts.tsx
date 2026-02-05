import React from "react";
import { useNavigate } from "react-router-dom";

interface RecommendedProduct {
  id: string | number;
  name: string;
  brand: string;
  naming_system?: string;
  price: string | number;
  image: string;
  images?: string[];
  skuid: string;
  colors?: string[];
}

interface RecommendedProductsProps {
  products: RecommendedProduct[];
  currentProductId?: number | string;
}

const ProductCard = ({ product, onClick }: { product: RecommendedProduct; onClick: () => void }) => {
  const [hasSecondImage, setHasSecondImage] = React.useState(true);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative p-4">
        {/* Product Image Container */}
        <div className="bg-[#f5f5f5] relative aspect-[1.4] mb-3 overflow-hidden group-hover:bg-[#ebebeb] transition-colors">

          {/* Color Dots - Use variants array from API */}
          {(() => {
            // Get colors from variants if available, otherwise use color_names
            let colorDots: string[] = [];

            if ((product as any).variants && (product as any).variants.length > 0) {
              // Extract color_names from each variant
              colorDots = (product as any).variants
                .map((v: any) => v.color_names?.[0])
                .filter((c: string) => c); // Remove undefined/null
            } else if ((product as any).color_names && (product as any).color_names.length > 0) {
              colorDots = (product as any).color_names;
            }

            if (colorDots.length === 0) return null;

            // Import color mapping function
            const getHexColorsFromNames = (names: string[]) => {
              const colorMap: { [key: string]: string } = {
                'Black': '#000000', 'White': '#FFFFFF', 'Brown': '#8B4513',
                'Blue': '#0066CC', 'Red': '#DC143C', 'Green': '#228B22',
                'Grey': '#808080', 'Silver': '#C0C0C0', 'Gold': '#FFD700',
                'Pink': '#FFC0CB', 'Purple': '#800080', 'Orange': '#FF8C00',
                'Beige': '#F5F5DC', 'Tortoise': '#8B4513', 'Transparent': '#FFFFFF'
              };
              return names.map(name => colorMap[name] || name);
            };

            return (
              <div className="absolute top-2 left-2 z-10 flex gap-1 items-center bg-white/80 backdrop-blur-sm px-1.5 py-1 rounded-full">
                {colorDots.map((colorName: string, i: number) => {
                  const colorHex = getHexColorsFromNames([colorName])[0] || colorName;
                  return (
                    <span
                      key={i}
                      style={{ backgroundColor: colorHex }}
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      title={colorName}
                    ></span>
                  )
                })}
              </div>
            );
          })()}

          <div className="absolute inset-0 flex items-center justify-center p-8">
            {/* Image 1 - Visible by default - Base image (images[0]) */}
            <img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply transition-all duration-500 group-hover:opacity-0"
            />
            {/* Image 2 - Hidden until hover - Shows images[1] */}
            <img
              src={product.images?.[1] || product.image}
              alt={`${product.name} hover`}
              className="w-full h-full object-contain mix-blend-multiply absolute inset-0 transition-all duration-500 opacity-0 group-hover:opacity-100"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Product Info - Naming System and Price */}
        <div className="flex justify-between items-end px-1 mt-2">
          <span className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wider">
            {product.naming_system}
          </span>
          <span className="text-sm font-bold text-[#1F1F1F]">
            £{product.price}
          </span>
        </div>
      </div>
    </div>
  );
};

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  products,
  currentProductId,
}) => {
  const navigate = useNavigate();

  // Filter out current product and sort by relevance
  if (!products || !Array.isArray(products) || !currentProductId) return null;

  // Find current product details to compare against
  const currentProduct = products.find(p => String(p.id) === String(currentProductId) || p.skuid === String(currentProductId));

  const recommendedProducts = products
    .filter((p) => String(p.id) !== String(currentProductId) && p.skuid !== String(currentProductId))
    .map(p => {
      let score = 0;
      if (!currentProduct) return { ...p, score: 0 }; // Fallback if current product not found in list

      // Scoring logic
      // Scoring logic - Prioritize Shape & Naming System as requested
      // Shape Match (Highest Priority)
      if ((p as any).shape && (currentProduct as any).shape && (p as any).shape === (currentProduct as any).shape) score += 10;

      // Naming System Match
      if (p.naming_system && currentProduct.naming_system && p.naming_system === currentProduct.naming_system) score += 5;

      // Brand Match
      if (p.brand === currentProduct.brand) score += 3;

      // Secondary factors
      if ((p as any).material && (currentProduct as any).material && (p as any).material === (currentProduct as any).material) score += 1;
      if ((p as any).gender && (currentProduct as any).gender && (p as any).gender === (currentProduct as any).gender) score += 1;

      // Color matching (if any color matches)
      if (p.colors && currentProduct.colors && p.colors.some(c => currentProduct.colors?.includes(c))) score += 1;

      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score) // Sort by highest score
    .slice(0, 4);

  if (recommendedProducts.length === 0) return null;

  return (
    <div className="w-full py-12">
      <div className="max-w-[1480px] mx-auto">
        {/* Section Header */}
        <h2 className="text-2xl md:text-3xl font-bold text-[#1F1F1F] mb-8 text-center">
          RECOMMENDED FOR YOU
        </h2>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 bg-[#F7F7F7]">
          {recommendedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() =>
                navigate(`/product/${product.skuid}`, { state: { product } })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;
