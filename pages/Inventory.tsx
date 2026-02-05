import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../api/retailerApis";
import { Loader } from "../components/Loader";
import ShelfDialog from "../components/product/ShelfDialog";

const Inventory: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(14);
  const [searchQuery, setSearchQuery] = useState("");
  const [shelfOpen, setShelfOpen] = useState(false);
  const [selectedSkuid, setSelectedSkuid] = useState("");

  // Fetch Inventory
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["inventory", page, rowsPerPage, searchQuery],
    queryFn: async () => {
      try {
        const response = await getAllProducts({
          page: page + 1,
          page_size: rowsPerPage,
          search_query: searchQuery,
        });
        if (response?.data?.status) {
          return response.data;
        }
        return { products: [], pagination: { count: 0 } };
      } catch (e) {
        console.error("Failed to fetch inventory", e);
        return { products: [], pagination: { count: 0 } };
      }
    },
    retry: false,
  });

  const rows = data?.products || [];
  const totalCount = data?.pagination?.count || 0;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleProductClick = (skuid: string) => {
    setSelectedSkuid(skuid);
    setShelfOpen(true);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-[22px] font-bold text-[#1F1F1F] mb-6">Inventory</h1>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-gray-100">
            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
              {/* Search */}
              <div className="relative w-full md:max-w-[300px] flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3">
                <div className="text-[#2B7DCD]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full py-2.5 pl-2 bg-transparent border-none focus:outline-none text-sm font-medium text-[#1F1F1F]"
                />
              </div>

              {/* Filter Icon */}
              <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-[#2B7DCD] transition-colors">
                <img
                  src="https://raw.githubusercontent.com/feathericons/feather/master/icons/filter.svg"
                  alt="filter"
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[#1F1F1F] font-bold text-xs uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-center w-16">S.no.</th>
                  <th className="px-6 py-4">Store SkuID</th>
                  <th className="px-6 py-4">SkuID</th>
                  <th className="px-6 py-4">Shape</th>
                  <th className="px-6 py-4">Material</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-right">Offer Price</th>
                  <th className="px-6 py-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.length > 0 ? (
                  rows.map((row: any, index: number) => {
                    const product = row.products || {};
                    return (
                      <tr
                        key={product.skuid || index}
                        className="hover:bg-[#F3F0E7]/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-gray-500 font-medium">
                          {page * rowsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleProductClick(product.skuid)}
                            className="font-bold text-[#015490] hover:underline"
                          >
                            {product.store_skuid || "-"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleProductClick(product.skuid)}
                            className="font-bold text-[#015490] hover:underline"
                          >
                            {product.skuid || "-"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {product.shape || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {product.material || "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {row.stock >= 1 ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase mb-1">
                                In stock
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {row.stock} left
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase mb-1">
                                Out of stock
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                0 left
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#1F1F1F]">
                          Rs. {product.list_price}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#4596F3]">
                          Rs. {product.price}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-50 rounded-full p-6 mb-4">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-40"
                          >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          No records found!
                        </h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {rows.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between bg-gray-50 gap-4">
              <div className="text-xs text-gray-500 font-medium flex items-center gap-4">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                  className="bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-bold text-[#1F1F1F] focus:outline-none focus:border-[#232320]"
                >
                  <option value={14}>14</option>
                  <option value={28}>28</option>
                  <option value={50}>50</option>
                </select>
                <span>
                  Showing {page * rowsPerPage + 1} -{" "}
                  {Math.min((page + 1) * rowsPerPage, totalCount)} of{" "}
                  {totalCount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <span className="text-xs font-bold text-[#1F1F1F] px-2">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {shelfOpen && (
          <ShelfDialog
            open={shelfOpen}
            refetch={refetch}
            onClose={() => setShelfOpen(false)}
            skuid={selectedSkuid}
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;
