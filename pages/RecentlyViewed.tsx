import React, { useEffect, useState } from "react";
import AccountSidebar from "../components/AccountSidebar";
import { getRecentlyViewed, getProductDetails } from "../api/retailerApis";
import { useNavigate } from "react-router-dom";

const RecentlyViewed: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const response = await getRecentlyViewed();
        if (response.data && response.data.success) {
          const ids = response.data.data;

          // Only fetch if there are actually recently viewed products
          if (ids && ids.length > 0) {
            const productPromises = ids.map((id: string) =>
              getProductDetails(id, null, null)
            );
            const productsResponses = await Promise.all(productPromises);
            const validProducts = productsResponses
              .filter((res: any) => res.data && res.data.status)
              .map((res: any) => res.data.data);

            setProducts(validProducts);
          }
        }
      } catch (error) {
        console.error("Failed to fetch recently viewed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans pb-12">
      {/* Hero Banner */}
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
        <img
          src="recent banner.jpg"
          alt="Banner"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-cyan-400/20 to-purple-500/20 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-0 z-10">
          <div
            className="bg-white px-12 py-4 relative shadow-lg"
            style={{
              clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
              paddingLeft: "4rem",
              paddingRight: "4rem",
            }}
          >
            <h1 className="text-xl md:text-2xl font-bold text-[#1F1F1F] uppercase tracking-widest text-center whitespace-nowrap">
              Recently Viewed
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-0 md:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-auto shadow-soft rounded-sm overflow-hidden">
            <AccountSidebar activeItem="RECENTLY VIEWED" />
          </div>

          <div className="flex-1 bg-white p-8 rounded-sm shadow-soft min-h-[500px] w-full flex flex-col items-center justify-start">
            {loading ? (
              <div className="flex items-center justify-center w-full h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E94D37]"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {products.map((product) => (
                  <div
                    key={product.skuid || product.id}
                    className="group cursor-pointer border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    onClick={() =>
                      navigate(`/product/${product.skuid || product.id}`)
                    }
                  >
                    <div className="aspect-[3/2] bg-gray-50 relative overflow-hidden">
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-contain transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                      />
                      <img
                        src={(product.image || "/placeholder.png").replace("_1.jpg", "_2.jpg")}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[#1F1F1F] text-sm mb-1 truncate">
                        {product.naming_system || product.brand || "Multifolks"}
                      </h3>
                      <p className="text-gray-600 text-xs mb-2 truncate">
                        {product.name}
                      </p>
                      <p className="text-[#E94D37] font-bold">
                        £
                        {product.price
                          ? product.price
                          : product.list_price || "0"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative mb-6"></div>
                <img src="/icon_not_reviewed.png" alt="No items" />
                <p className="text-[#525252] text-sm font-bold text-center tracking-wide mt-4">
                  You have not explored any product yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;
