import { CartItem } from "../types";

const toNumber = (value: unknown, fallback = 0): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

type LensSelectionOverride = {
    lensPackage?: string;
    lensPackagePrice?: number;
    lensCategory?: string;
    prescriptionTier?: string;
    mainCategory?: string;
    coatingTitle?: string;
    coatingPrice?: number;
    tintType?: string;
    tintColor?: string;
    tintPrice?: number;
    updatedAt?: number;
};

const OVERRIDES_KEY = "cart_lens_overrides_v1";

const readOverrides = (): Record<string, LensSelectionOverride> => {
    try {
        const raw = sessionStorage.getItem(OVERRIDES_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

const writeOverrides = (next: Record<string, LensSelectionOverride>) => {
    try {
        sessionStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
    } catch {
        // ignore storage failures
    }
};

export const setCartLensOverride = (cartId: number | string, override: LensSelectionOverride) => {
    const key = String(cartId);
    const existing = readOverrides();
    existing[key] = { ...(existing[key] || {}), ...override, updatedAt: Date.now() };
    writeOverrides(existing);
};

export const formatFrameSize = (size?: string): string => {
    if (!size) return "MEDIUM";
    const sizeUpper = size.toUpperCase().trim();
    if (sizeUpper === "S" || sizeUpper === "SMALL") return "SMALL";
    if (sizeUpper === "M" || sizeUpper === "MEDIUM") return "MEDIUM";
    if (sizeUpper === "L" || sizeUpper === "LARGE") return "LARGE";
    return sizeUpper; // Return as-is if already formatted
};

export const getCartLensOverride = (cartId: number | string): LensSelectionOverride | null => {
    const key = String(cartId);
    const existing = readOverrides();
    return existing[key] || null;
};

export const getLensPackagePrice = (item: CartItem): number => {
    const itemAny = item as any;
    const lensAny = (itemAny?.lens ?? itemAny?.lens_data ?? itemAny?.lensData) as any;

    // Highest priority: explicit selection override stored at selection time
    const override = getCartLensOverride((itemAny?.cart_id ?? itemAny?.id) as any);
    if (override?.lensPackagePrice != null) {
        return toNumber(override.lensPackagePrice, 0);
    }

    // For sunglasses tint flows, the tint price should be shown under "Lens Tint" (not Lens Index)
    // so we treat lens package price as 0 unless explicitly overridden above.
    if ((override?.tintPrice != null) || lensAny?.tint_price != null || lensAny?.tint_type != null || lensAny?.lens_category === "sun") {
        return 49;
    }

    // Prefer item-level fields (often set by selectLens / add-to-cart flows)
    const itemLevel =
        itemAny?.lensPackagePrice ??
        itemAny?.lens_package_price ??
        itemAny?.lensPrice ??
        itemAny?.lens_price;

    // Then lens object fields
    const lensLevel =
        lensAny?.lens_package_price ??
        lensAny?.lensPackagePrice ??
        lensAny?.selling_price ??
        lensAny?.price;

    return toNumber(itemLevel ?? lensLevel ?? 0, 0);
};

export const getLensCoating = (item: CartItem): { name: string; price: number } => {
    const itemAny = item as any;
    const lensAny = (itemAny?.lens ?? itemAny?.lens_data ?? itemAny?.lensData) as any;

    // Highest priority: explicit selection override stored at selection time
    const override = getCartLensOverride((itemAny?.cart_id ?? itemAny?.id) as any);
    if (override?.coatingTitle || override?.coatingPrice != null) {
        return {
            name: String(override.coatingTitle || "Coating"),
            price: toNumber(override.coatingPrice ?? 0, 0),
        };
    }

    console.log("🔍 DEBUG getLensCoating:", {
        cart_id: (item as any).cart_id,
        coating: lensAny?.coating,
        coating_price: lensAny?.coating_price,
        coatingPrice: itemAny?.coatingPrice,
        coatingId: itemAny?.coatingId,
        lens_title: lensAny?.title,
        lens_name: lensAny?.name,
        sub_category: lensAny?.sub_category,
        full_lens_object: lensAny
    });

    // Try to get coating from various possible fields
    // 1. Check item-level coating fields (from selectLens API call)
    if (itemAny?.coatingId || itemAny?.coating || itemAny?.coatingPrice != null || itemAny?.coating_price != null) {
        const coatingName = itemAny?.coatingTitle || itemAny?.coating || "Coating";
        const coatingPrice = toNumber(itemAny?.coatingPrice ?? itemAny?.coating_price ?? 0, 0);
        const result = { name: coatingName, price: coatingPrice };
        console.log("✅ getLensCoating result (from item coating):", result);
        return result;
    }

    // 2. Check lens object coating field
    if (lensAny?.coating) {
        const result = {
            name: String(lensAny.coating),
            price: toNumber(lensAny.coating_price ?? 0, 0)
        };
        console.log("✅ getLensCoating result (from lens.coating):", result);
        return result;
    }

    // 2.5 If price exists on lens but name doesn't, still show price
    if (lensAny?.coating_price != null) {
        const result = { name: "Coating", price: toNumber(lensAny.coating_price, 0) };
        console.log("✅ getLensCoating result (from lens.coating_price):", result);
        return result;
    }

    // 3. Try to extract from lens title/name (e.g., "1.61 Blue Protect - Anti Reflective")
    const lensTitle = lensAny?.title || lensAny?.name || "";
    if (lensTitle) {
        const coatingMatch = lensTitle.match(/(Anti Reflective|Water Resistant|Oil Resistant|Scratch Resistant)/i);
        if (coatingMatch) {
            const coatingName = coatingMatch[1];
            const coatingPrice = toNumber(lensAny?.coating_price ?? itemAny?.coatingPrice ?? 0, 0);
            const result = { name: coatingName, price: coatingPrice };
            console.log("✅ getLensCoating result (from lens title):", result);
            return result;
        }
    }

    // 4. Check if sub_category contains coating information
    const subCategory = lensAny?.sub_category || "";
    const coatingNames = [
        "Anti Reflective Coating",
        "Water Resistant",
        "Oil Resistant Coating",
        "Scratch Resistant"
    ];

    for (const coating of coatingNames) {
        if (subCategory.includes(coating)) {
            const coatingPrice = toNumber(itemAny.coatingPrice ?? lensAny?.coating_price ??
                (coating === "Anti Reflective Coating" ? 0 :
                    coating === "Water Resistant" ? 10 : 15), 0);
            const result = { name: coating, price: coatingPrice };
            console.log("✅ getLensCoating result (from sub_category):", result);
            return result;
        }
    }

    // Default to Anti Reflective Coating
    const defaultResult = { name: "Anti Reflective Coating", price: 0 };
    console.log("✅ getLensCoating result (default):", defaultResult);
    return defaultResult;
};

export const getTintInfo = (item: CartItem): { type: string; color: string; price: number } | null => {
    const itemAny = item as any;
    const lensAny = (itemAny?.lens ?? itemAny?.lens_data ?? itemAny?.lensData ?? item.lens) as any;

    // Highest priority: explicit selection override stored at selection time
    const override = getCartLensOverride((itemAny?.cart_id ?? itemAny?.id) as any);
    if (override?.tintType || override?.tintPrice != null) {
        const tintPrice = toNumber(override.tintPrice ?? 0, 0);
        // Only return tint info if price > 0, otherwise let coating display
        if (tintPrice > 0 || override.tintType) {
            return {
                type: String(override.tintType || "Tint"),
                color: String(override.tintColor || ""),
                price: tintPrice,
            };
        }
    }

    // Backend / lens object fields
    if (lensAny?.tint_type || lensAny?.lens_category === "sun" || lensAny?.tint_price != null) {
        const tintType = lensAny?.tint_type || lensAny?.sub_category || "Tint";
        const tintColor = lensAny?.tint_color || "";
        const tintPrice = toNumber(lensAny?.tint_price ?? 0, 0);

        // CRITICAL FIX: Only return tint info if price > 0
        // If tint_price is 0, return null so coating can be displayed instead
        if (tintPrice > 0) {
            return {
                type: String(tintType),
                color: String(tintColor),
                price: tintPrice,
            };
        }
    }

    return null;
};

export const calculateItemTotal = (item: CartItem): number => {
    const framePrice = Number(item.product?.products?.list_price || 0);
    const lensPrice = getLensPackagePrice(item);
    const tintInfo = getTintInfo(item);

    // CRITICAL FIX: Use tint price only if tintInfo exists AND price > 0
    // Otherwise, use coating price as fallback
    const addOnPrice = (tintInfo && tintInfo.price > 0)
        ? Number(tintInfo.price || 0)
        : Number(getLensCoating(item).price || 0);

    const quantity = Number(item.quantity || 1);
    return (framePrice + lensPrice + addOnPrice) * quantity;
};

export const calculateCartSubtotal = (cartItems: CartItem[]): number => {
    return cartItems.reduce((acc, item) => {
        return acc + calculateItemTotal(item);
    }, 0);
};

// Helper function to get lens type display
export const getLensTypeDisplay = (item: CartItem): string => {
    const itemAny = item as any;
    const lensAny = item.lens as any;

    // Check override first (this is where frontend stores the selected lens category and tier)
    const override = getCartLensOverride(item.cart_id);

    // Use override mainCategory if available, otherwise use backend main_category
    const mainCategory = override?.mainCategory || item.lens?.main_category || "";

    // Extract prescription tier from main_category
    let tier = "";
    const mainCategoryLower = mainCategory.toLowerCase();
    if (mainCategoryLower.includes("premium progressive")) {
        tier = "Premium Progressive";
    } else if (mainCategoryLower.includes("standard progressive")) {
        tier = "Standard Progressive";
    } else if (mainCategoryLower.includes("bifocal")) {
        tier = "Bifocal";
    } else if (mainCategoryLower.includes("progressive")) {
        // Generic progressive if not specified
        tier = "Progressive";
    } else {
        // Fallback to main_category if it doesn't match known patterns
        tier = mainCategory || "Progressive";
    }

    // Get lens category - check override first, then backend fields
    let category = "";
    const lensCategory = override?.lensCategory || lensAny?.lens_category || itemAny?.lensCategory;

    if (lensCategory) {
        const cat = String(lensCategory).toLowerCase();
        if (cat === "blue") category = "Blue Protect";
        else if (cat === "clear") category = "Clear";
        else if (cat === "photo" || cat === "photochromic") category = "Photochromic";
        else if (cat === "sun" || cat === "sunglasses") category = "Sunglasses";
    } else {
        // Try to extract from sub_category as fallback
        const subCategory = item.lens?.sub_category || "";
        const subLower = subCategory.toLowerCase();
        if (subLower.includes("blue")) {
            category = "Blue Protect";
        } else if (subLower.includes("clear")) {
            category = "Clear";
        } else if (subLower.includes("photo")) {
            category = "Photochromic";
        } else if (subLower.includes("sun")) {
            category = "Sunglasses";
        }
    }

    // Combine tier and category in the format: "Tier-Category"
    const result = category ? `${tier}-${category}` : tier;
    return result;
};

// Helper function to extract lens index
export const getLensIndex = (item: CartItem): { index: string; price: number } => {
    const itemAny = item as any;
    const lensAny = (itemAny?.lens ?? itemAny?.lens_data ?? itemAny?.lensData ?? item.lens) as any;
    const sellingPrice = getLensPackagePrice(item);
    const override = getCartLensOverride((itemAny?.cart_id ?? itemAny?.id) as any);

    // Get the lens index number
    let indexNumber = "1.61"; // default
    let lensPackagePrice = sellingPrice;

    // 1. Try to get from item-level fields (from selectLens API call)
    if (override?.lensPackage) {
        indexNumber = String(override.lensPackage);
    } else if (itemAny?.lensPackage) {
        indexNumber = String(itemAny.lensPackage);
        lensPackagePrice = Number(itemAny?.lensPackagePrice ?? itemAny?.lens_package_price ?? sellingPrice);
    }
    // 2. Try to get from lens_package field in lens object
    else if (lensAny?.lens_package) {
        indexNumber = String(lensAny.lens_package);
    }
    // 3. Try to extract from lens title/name (e.g., "1.61 Blue Protect High Index")
    else if (lensAny?.title || lensAny?.name) {
        const lensTitle = lensAny?.title || lensAny?.name;
        const indexMatch = lensTitle.match(/(1\.\d+)/);
        if (indexMatch) {
            indexNumber = indexMatch[1];
        }
    }
    // 4. Try to extract index from sub_category (e.g., "1.61", "1.67", "1.74")
    else {
        const subCategory = lensAny?.sub_category || "";
        const indexMatch = subCategory.match(/(\d\.\d+)/);
        if (indexMatch) {
            indexNumber = indexMatch[1];
        }
    }

    // Get lens category to construct full name
    const lensCategory = itemAny?.lensCategory || lensAny?.lens_category || "";
    const cat = String(lensCategory).toLowerCase();

    // Construct the full lens package name
    let fullName = "";
    if (cat === "blue") {
        fullName = `${indexNumber} Blue Protect High Index`;
    } else if (cat === "photo" || cat === "photochromic") {
        fullName = `${indexNumber} Photochromic High Index`;
    } else if (cat === "sun" || cat === "sunglasses") {
        fullName = `${indexNumber} High Index`;
    } else if (cat === "clear" || cat === "") {
        fullName = `${indexNumber} High Index`;
    } else {
        // Fallback: just use the index number with "High Index"
        fullName = `${indexNumber} High Index`;
    }

    const normalizedPrice = Number.isFinite(Number(lensPackagePrice)) ? Number(lensPackagePrice) : 0;
    return { index: fullName, price: normalizedPrice };
};
