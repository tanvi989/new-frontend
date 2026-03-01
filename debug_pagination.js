/*
ADD THIS CODE TO AllProducts.tsx around line 558-560:

Replace the existing console.log with this comprehensive logging:

*/

console.log("🔍 === PAGINATION & CACHING DEBUG ===");
console.log("📊 Request Parameters:", params);
console.log("📦 Current Page:", currentPage);
console.log("📦 Items Per Page:", itemsPerPage);
console.log("📦 Total Pages Expected:", Math.ceil(1000 / itemsPerPage)); // Rough estimate

const startTime = performance.now();
const response = await getAllProducts(params);
const endTime = performance.now();
const requestTime = endTime - startTime;

console.log("⚡ Request Time:", requestTime.toFixed(2), "ms");
console.log("📥 Full Backend Response:", response);
console.log("📥 Response Data:", response.data);
console.log("📥 Response Success:", response.data?.success);
console.log("📥 Pagination Info:", response.data?.pagination);

// Check if data is cached (React Query)
const isCached = response.request?.responseURL === undefined;
console.log("💾 Data from Cache:", isCached ? "✅ YES" : "❌ NO");

let rawProducts = response.data?.data || response.data?.products || [];
console.log("📦 Extracted Products Count:", rawProducts.length);
console.log("📦 First Product Sample:", rawProducts[0] ? "✅ Found" : "❌ Empty");

// Pagination details
const pagination = response.data?.pagination;
if (pagination) {
  console.log("📄 Backend Pagination:");
  console.log("  - Current Page:", pagination.page || pagination.currentPage);
  console.log("  - Total Products:", pagination.total || pagination.totalProducts);
  console.log("  - Total Pages:", pagination.pages || pagination.totalPages);
  console.log("  - Has Next:", pagination.hasNext);
  console.log("  - Has Previous:", pagination.hasPrevious);
} else {
  console.log("⚠️ No pagination data from backend");
}

console.log("🎯 === END DEBUG ===");

/*
ALSO ADD THIS after the query definition (around line 492):

*/

staleTime: 5 * 60 * 1000, // 5 minutes cache
cacheTime: 10 * 60 * 1000, // 10 minutes cache
keepPreviousData: true, // Keep previous data while loading new

/*
AND ADD THIS to see React Query cache status (around line 485-492):

*/

console.log("🗄️ React Query Cache Status:");
console.log("  - Is Loading:", isLoading);
console.log("  - Is Fetching:", isFetching);
console.log("  - Is Error:", isError);
console.log("  - Has Data:", !!productsDataResponse);
console.log("  - Data Last Updated:", productsDataResponse?.dataUpdatedAt);
