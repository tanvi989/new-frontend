
import axios from "./axiosConfig";
import { getCartLensOverride } from "../utils/priceUtils";
import { parseDimensionsString } from "../utils/frameDimensions";
import {
    addToLocalCart,
    getLocalCartResponse,
    removeFromLocalCart,
    updateQuantityLocalCart,
    clearLocalCart,
} from "../utils/localCartStorage";

// --- API CALLS ---
// Use HTTPS backend from Vite env or fallback to your new backend

// MOCKED: Check if user is registered
export const isRegisteredUser = (data: any) => {
    // return axios.post('/retailer/is-registered-user', data)
    return Promise.resolve({
        data: {
            status: true,
            data: { is_registered: false } // Assume new user for demo flow to show OTP
        }
    });
}

// MOCKED: Validate OTP/Customer
export const validateCustomer = (data: any) => {
    // return axios.post('/retailer/validate-customer', data)
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    status: true,
                    customer: {
                        id: "MOCK_CUST_001",
                        first_name: data.first_name || "Guest",
                        last_name: data.last_name || "User",
                        phone_number: data.phone_number,
                        email: data.email,
                        claimstatus: false
                    },
                    access_token: "mock-access-token-" + Date.now()
                }
            });
        }, 50); // Reduced to 50ms for instant feel
    });
}

export const getQuestion = (params: any) => {
    return axios.get('/retailer/get-question', { params })
}

export const claimReportDownload = (params: any) => {
    return axios.get('/retailer/claim-report-export', { params: params, responseType: 'blob' })
}

export const answerQuestion = (params: any) => {
    return axios.post('/retailer/answer-question', params)
}

// MOCKED: Login
export const retailerLogin = (data: any) => {
    // return axios.post('/accounts/retailer-login', data)
    return Promise.resolve({
        data: {
            status: true,
            access_token: "mock-token-" + Date.now(),
            first_name: "Retailer",
            message: "Login Successful"
        }
    });
}

// Mock function to simulate sending an email
export const sendWelcomeEmail = (email: string, name: string) => {
    return new Promise<void>((resolve) => {
        console.log(`
%c---------------------------------------------------
 EMAIL SENT TO: ${email}
---------------------------------------------------
Subject: Welcome to MultiFolks!

Hi ${name},

Thanks for signing up â€” glad to have you here.

Our smarter tech, affordable pricing, and glasses are designed for how you actually live â€” not just how you see.

You'll hear from us with tips, offers, and updates tailored to your needs. But we'll keep it useful, not overwhelming. Promise.

Experience the life-enhancing power of multifocals with MultiFolks.

Now is time to experience the life-enhancing power of multifocals with MultiFolks.

Get in touch with us in case of any query or concern.
support@multifolks.com
---------------------------------------------------
        `, "color: #025048; font-weight: bold;");

        // Simulate network delay
        setTimeout(() => {
            resolve();
        }, 50);
    });
}

export const eyeCheckup = () => {
    return axios.get('/retailer/eye-checkup')
}

export const createEyeCheckup = (data: any) => {
    return axios.post('/retailer/eye-checkup', { data });
}

export const getClaimReport = () => {
    return axios.get('/retailer/claim-report')
}

export const getCustomers = () => {
    return axios.get('/retailer/customers')
}

export const getCustomerDetails = (params: any) => {
    return axios.get('/retailer/customers', { params })
}

export const isLoggedIn = () => {
    return !!localStorage.getItem('token');
}

export const getFrames = (gender?: string, limit: number = 1000) => {
    const params: any = { limit };
    if (gender) params.gender = gender;
    return axios.get('/api/v1/products/all', { params }).then(response => {
        // Transform response: Backend returns { products: [...] }, Component expects response.data.data = [...]
        if (response.data && response.data.products) {
            return {
                ...response,
                data: {
                    ...response.data,
                    data: response.data.products // Map 'products' to 'data' for component compatibility
                }
            };
        }
        return response;
    });
}

export const getLenses = (params: any) => {
    return axios.get('/retailer/lens-inventory', { params });
}

// REAL: Get All Products with Filters
export const getAllProducts = (params: any) => {
    // params should match the backend query parameters:
    // gender, price_min, price_max, shape, colors, material, collections, comfort, size, brand, style
    // Arrays should be passed as repeated query params (axios handles this with paramsSerializer or default behavior usually works for simple arrays)
    return axios.get('/api/v1/products', {
        params,
        paramsSerializer: {
            indexes: null // No brackets for arrays: shape=Round&shape=Square
        }
    });
}

// REAL: Get Product by ID
export const getProductById = (id: string) => {
    return axios.get(`/api/v1/products/${id}`);
}

// REAL: Get Product by SKU
export const getProductBySku = (sku: string) => {
    return axios.get(`/api/v1/products/sku/${sku}`);
}

/** VTO image URL pattern: replace {skuid} with product skuid */
export const VTO_IMAGE_BASE = 'https://storage.googleapis.com/myapp-image-bucket-001/vto/vto_ready';
export const getVtoImageUrl = (skuid: string) => `${VTO_IMAGE_BASE}/${skuid}_VTO.png`;

/**
 * Fetch products whose frame width (from dimensions) is similar to face width.
 * Uses getFrames() then filters by parsed dimensions; returns up to limit products.
 * If list API doesn't return dimensions, products are fetched by SKU (slower).
 */
export const getVtoFramesByFaceWidth = async (
    faceWidthMm: number,
    toleranceMm: number = 8,
    limit: number = 6
): Promise<any[]> => {
    const res = await getFrames(undefined, 500);
    const list: any[] = res?.data?.data || res?.data?.products || [];
    const withWidth: { product: any; width: number }[] = [];

    for (const p of list) {
        let width: number;
        if (p.dimensions) {
            width = parseDimensionsString(p.dimensions).width;
        } else if (p.skuid) {
            try {
                const skuRes = await getProductBySku(p.skuid);
                const product = skuRes?.data?.data ?? skuRes?.data;
                width = product?.dimensions ? parseDimensionsString(product.dimensions).width : 0;
            } catch {
                continue;
            }
        } else {
            continue;
        }
        if (Math.abs(width - faceWidthMm) <= toleranceMm) {
            withWidth.push({ product: p, width });
        }
    }

    withWidth.sort((a, b) => Math.abs(a.width - faceWidthMm) - Math.abs(b.width - faceWidthMm));
    return withWidth.slice(0, limit).map(({ product }) => product);
};

export const updateInventory = (data: any) => {
    return axios.put('/retailer/product-inventory', data)
}

/** Parse price from "£139.00", "139", 139, etc. Returns number (pounds). */
function parsePrice(value: unknown): number {
    if (value == null) return 0;
    const n = Number(value);
    if (Number.isFinite(n)) return Math.round(n * 100) / 100;
    const str = String(value).replace(/[^\d.]/g, '');
    const parsed = parseFloat(str);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

// MOCKED: Add to Cart
// REAL: Add to Cart (Hybrid: API or LocalStorage)
// options: { lensPackagePrice?, coatingPrice?, lensPackage?, coatingTitle?, ... } - optional lens/coating to send upfront
export const addToCart = (products: any, flag: any, prescription?: any, options?: {
    lensPackagePrice?: number;
    coatingPrice?: number;
    lensPackage?: string;
    coatingTitle?: string;
    selectedColor?: string;
}) => {
    // Always send to Backend (Guest ID handled by axios interceptor)
    const uniqueSku = `${products.skuid || products.id}_${Date.now()}`; // Generate unique SKU to force new item

    const framePrice = parsePrice(products.price ?? products.list_price ?? 0);
    const lensPrice = options?.lensPackagePrice ?? 0;
    const coatingPrice = options?.coatingPrice ?? 0;
    const totalPrice = framePrice + lensPrice + coatingPrice;

    const itemData: any = {
        product_id: uniqueSku, // Use unique SKU
        name: products.name || products.product_name,
        image: products.image,
        price: totalPrice,
        quantity: 1,
        // Send product details for fallback in case join fails
        product_details: {
            name: products.name || products.product_name,
            price: framePrice,
            image: products.image,
            frame_color: products.colors && products.colors.length > 0 ? (typeof products.colors[0] === 'string' ? products.colors[0] : products.colors[0].frameColor) : (options?.selectedColor || 'Black'),
            lens_type: "Single Vision",
            original_sku: products.skuid || products.id
        },
        product: {
            products: {
                ...products,
                list_price: framePrice,
                price: framePrice,
                brand: products.brand || "Multifolks",
                framecolor: products.colors && products.colors.length > 0 ? (typeof products.colors[0] === 'string' ? products.colors[0] : products.colors[0].frameColor) : (options?.selectedColor || 'Black'),
                style: products.style || 'Standard',
                gender: "Unisex",
                size: products.size || "M",
                image: products.image
            }
        },
        lens: {
            sub_category: "Single Vision",
            selling_price: lensPrice,
            price: lensPrice,
            coating_price: coatingPrice,
            coating: options?.coatingTitle,
            lens_package: options?.lensPackage,
        },
        flag: flag
    };

    // Include prescription if provided
    if (prescription) {
        itemData.prescription = prescription;
    }

    console.log("DEBUG: addToCart called with UNIQUE SKU", uniqueSku, itemData);
    console.log("DEBUG: Current Guest ID:", localStorage.getItem('guest_id'));

    function addToLocalAndReturnSuccess(): Promise<{ data: { success: true; status: true; cart_id: number; message?: string } }> {
        try {
            const localItem = addToLocalCart(itemData);
            return Promise.resolve({
                data: { success: true, status: true, cart_id: localItem.cart_id, message: "Added to cart (saved locally)" }
            });
        } catch (e) {
            console.warn("addToLocalCart failed, using synthetic cart_id", e);
            const syntheticId = Date.now();
            return Promise.resolve({
                data: { success: true, status: true, cart_id: syntheticId, message: "Added to cart" }
            });
        }
    }

    return axios
        .post('/api/v1/cart/add', itemData)
        .then(response => {
            console.log("DEBUG: addToCart response:", response.data);
            if (response?.data && (response.data.success === true || response.data.status === true)) {
                return {
                    ...response,
                    data: { ...response.data, status: true, success: true }
                };
            }
            console.warn("addToCart: API returned success false, using localStorage");
            return addToLocalAndReturnSuccess();
        })
        .catch(err => {
            console.warn("addToCart API failed, using localStorage:", err?.message || err);
            return addToLocalAndReturnSuccess();
        })
        .catch(() => {
            return addToLocalAndReturnSuccess();
        });
}

// Get Cart: API first, fallback to localStorage when API fails or returns success: false
function getCartFallbackData() {
    const local = getLocalCartResponse();
    return { status: true, success: true, ...local };
}

export const getCart = (params: any) => {
    return axios.get('/api/v1/cart', { params })
        .then(response => {
            console.log("API: getCart raw response:", response.data);
            const d = response?.data;
            if (d && d.success === true && Array.isArray(d.cart)) {
                return { data: { status: true, ...d } };
            }
            // API returned but not a valid cart (e.g. success: false) → use local
            console.warn("getCart: API response invalid, using localStorage fallback");
            return Promise.resolve({ data: getCartFallbackData() });
        })
        .catch(err => {
            console.warn("getCart API failed, using localStorage fallback:", err.message);
            return Promise.resolve({ data: getCartFallbackData() });
        });
}

// REAL: Clear entire cart (API + always clear localStorage so UI shows empty)
export const clearCart = () => {
    return axios.delete('/api/v1/cart/clear')
        .then(() => {
            clearLocalCart();
            return { data: { status: true, message: "Cart cleared" } };
        })
        .catch(() => {
            clearLocalCart();
            return Promise.resolve({ data: { status: true, message: "Cart cleared (local)" } });
        });
};

// REAL: Delete from Cart (API with localStorage fallback)
export const deleteProductFromCart = (cart_id: any, skuid: any, from: any) => {
    const id = cart_id != null ? Number(cart_id) : null;
    if (id == null || Number.isNaN(id)) {
        return Promise.resolve({ data: { status: false, message: "Invalid cart id" } });
    }
    return axios.delete(`/api/v1/cart/item/${id}`)
        .then((response) => {
            // Backend may return 200 with success: false when item not found (e.g. item only in local)
            if (response?.data?.success === false) {
                removeFromLocalCart(id);
            }
            return { data: { status: true, message: "Removed" } };
        })
        .catch(() => {
            removeFromLocalCart(id);
            return Promise.resolve({ data: { status: true, message: "Removed (local)" } });
        });
}

// REAL: Update Cart Quantity (API with localStorage fallback)
export const updateCartQuantity = (cart_id: number, quantity: number) => {
    return axios.put(`/api/v1/cart/quantity?cart_id=${cart_id}&quantity=${quantity}`)
        .then(() => ({ data: { status: true, message: "Quantity updated" } }))
        .catch(() => {
            updateQuantityLocalCart(cart_id, quantity);
            return Promise.resolve({ data: { status: true, message: "Quantity updated (local)" } });
        });
}

// SYNC: Sync Local Cart to Backend (Merge Guest Cart with Authenticated User Cart)
// ALTERNATIVE IMPLEMENTATION: Uses existing endpoints instead of problematic merge endpoint
export const syncLocalCartToBackend = async () => {
    console.log('ðŸ”„ syncLocalCartToBackend: Starting cart merge...');

    try {
        const token = localStorage.getItem('token');
        const guestId = localStorage.getItem('guest_id');

        if (!token || !guestId) {
            console.log('âŒ Skipping merge - missing token or guest_id');
            console.log('  - Has token:', !!token);
            console.log('  - Has guest_id:', !!guestId);
            return;
        }

        // Dispatch event to show loading state
        window.dispatchEvent(new Event('cart-merging'));
        console.log('ðŸ“¢ Dispatched cart-merging event (show loader)');

        console.log(`ðŸ“¦ Step 1: Fetching guest cart (${guestId})...`);

        // Fetch guest cart WITHOUT token (to get guest items)
        const guestCartResponse = await axios.get('/api/v1/cart', {
            headers: {
                'X-Guest-ID': guestId
            },
            // Override axios interceptor to not send token
            transformRequest: [(data, headers) => {
                delete headers.Authorization;
                return data;
            }]
        });

        const guestCart = guestCartResponse.data?.cart || [];
        console.log(`ðŸ“¦ Found ${guestCart.length} items in guest cart`);

        if (guestCart.length === 0) {
            console.log('âœ… No items to merge');
            localStorage.removeItem('guest_id');
            return;
        }

        // Step 2: Add each item to user cart (WITH token)
        console.log('ðŸ“¦ Step 2: Adding items to user cart...');
        let itemsMerged = 0;

        for (const item of guestCart) {
            try {
                const itemData = {
                    product_id: item.product?.products?.skuid || item.product?.products?.id,
                    name: item.product?.products?.name,
                    image: item.product?.products?.image,
                    price: item.product?.products?.list_price || item.price,
                    quantity: item.quantity || 1,
                    product: item.product,
                    lens: item.lens,
                    prescription: item.prescription,
                    flag: item.flag || 'normal'
                };

                // Add local override data if available
                const override = getCartLensOverride(item.cart_id);
                if (override) {
                    console.log(`   Found override for item ${item.cart_id}:`, override);

                    // Merge override into lens object
                    itemData.lens = {
                        ...itemData.lens,
                        lens_package: override.lensPackage,
                        lens_category: override.lensCategory,
                        main_category: override.mainCategory,
                        // Ensure price is carried over if it exists in override
                        lens_package_price: override.lensPackagePrice,
                        selling_price: override.lensPackagePrice ?? itemData.lens?.selling_price,
                        price: override.lensPackagePrice ?? itemData.lens?.price
                    };
                }

                console.log(`   Adding: ${itemData.name}`);

                // This will use the token from localStorage automatically
                await axios.post('/api/v1/cart/add', itemData);

                itemsMerged++;
                console.log(`   âœ… Added successfully`);
            } catch (error: any) {
                console.error(`   âŒ Failed to add item:`, error.message);
            }
        }

        console.log(`âœ… Successfully merged ${itemsMerged}/${guestCart.length} items`);

        // Step 3: Clear guest cart
        console.log('ðŸ“¦ Step 3: Clearing guest cart...');
        try {
            await axios.delete('/api/v1/cart/clear', {
                headers: {
                    'X-Guest-ID': guestId
                },
                transformRequest: [(data, headers) => {
                    delete headers.Authorization;
                    return data;
                }]
            });
            console.log('âœ… Guest cart cleared');
        } catch (error: any) {
            console.warn('âš ï¸  Failed to clear guest cart:', error.message);
        }

        // Step 4: Cleanup
        localStorage.removeItem('guest_id');
        console.log('ðŸ—‘ï¸  Removed guest_id from localStorage');

        window.dispatchEvent(new Event('cart-updated'));
        console.log('ðŸ“¢ Dispatched cart-updated event');

    } catch (error: any) {
        console.error('âŒ Cart merge failed:', error);
        console.error('  - Error:', error.message);
        console.error('  - Response:', error.response?.data);
        // Don't throw - cart sync is not critical for login flow
    }
}

// REAL: Select Lens
export const selectLens = (skuid: string, cart_id: number, lens_id: string | number, lensDetails?: any) => {
    // Determine main_category from lensDetails or default
    let mainCategory = "Progressive";
    if (lensDetails?.main_category) {
        mainCategory = lensDetails.main_category;
    } else if (lensDetails?.prescriptionTier === "advanced") {
        mainCategory = "Premium Progressive";
    } else if (lensDetails?.prescriptionTier === "standard") {
        mainCategory = "Standard Progressive";
    }

    // Check if this is a coating selection (title contains "Coating" or "Resistant")
    const isCoating = lensDetails?.title &&
        (lensDetails.title.includes("Coating") || lensDetails.title.includes("Resistant"));

    // Check if this is a lens package selection (has lensPackage and priceValue)
    const isLensPackage = lensDetails?.lensPackage && lensDetails?.priceValue;

    // Build sub_category
    let subCategory = lensDetails?.title || "Premium Lens";

    // Build lens data
    const lensData: any = {
        id: lens_id,
        sub_category: subCategory,
        main_category: mainCategory
    };

    // Explicitly handle Lens Package Price vs Coating Price
    if (lensDetails?.lensPackagePrice !== undefined) {
        lensData.selling_price = lensDetails.lensPackagePrice;
        lensData.price = lensDetails.lensPackagePrice;
    } else if (isLensPackage) {
        // Fallback: if only priceValue provided and it's a lens package
        lensData.selling_price = lensDetails.priceValue || 0;
        lensData.price = lensDetails.priceValue || 0;
    }

    if (isCoating) {
        lensData.coating = lensDetails.title;
        lensData.coating_price = lensDetails.priceValue || 0;
    } else if (!isLensPackage && !lensDetails?.lensPackagePrice) {
        // Only if NOT a package and NOT explicit price, use priceValue as default
        lensData.selling_price = lensDetails?.priceValue || 0;
        lensData.price = lensDetails?.priceValue || 0;
    }

    // Store lens category if available
    if (lensDetails?.lensCategory) {
        lensData.lens_category = lensDetails.lensCategory;
    }

    // Store lens package if available (even if not the primary selection)
    if (lensDetails?.lensPackage) {
        lensData.lens_package = lensDetails.lensPackage;
    }

    return axios.put('/api/v1/cart/lens', { cart_id, lens_data: lensData })
        .then(response => {
            return { data: { status: true, message: "Lens updated" } };
        });
}

// REAL: Add Prescription
export const addPrescription = (customer_id: any, type: any, mode: any, data: any, cart_id: any) => {
    console.log("DEBUG API: addPrescription called with:", { customer_id, type, mode, data, cart_id });
    
    const formData = new FormData();
    
    // Always include cart_id and mode
    if (cart_id) formData.append('cart_id', cart_id.toString());
    formData.append('mode', mode || 'manual');

    // Handle data
    if (data instanceof FormData) {
        // If data is already FormData (from file upload), we merge its entries
        for (const [key, value] of (data as any).entries()) {
            if (key !== 'cart_id' && key !== 'mode') {
                formData.append(key, value);
            }
        }
    } else {
        // If data is an object (Manual or existing prescription)
        const details = data.prescriptionDetails || data.data || data;
        const prescriptionData = {
            type: mode || details.type || 'manual',
            mode: mode || details.type || 'manual',
            data: details
        };
        formData.append('prescription_data', JSON.stringify(prescriptionData));
    }

    console.log("DEBUG API: addPrescription sending FormData");
    return axios.put('/api/v1/cart/prescription', formData);
}

export const removePrescription = (cart_id: any) => {
    const formData = new FormData();
    formData.append('cart_id', cart_id.toString());
    formData.append('prescription_data', ''); // Send empty string or handle 'null' on backend

    return axios.put('/api/v1/cart/prescription', formData);
}

export const getProductDetails = (product_skuid: any, selected_color: any, selected_size: any) => {
    // Call the real backend API
    return axios.get(`/api/v1/products/sku/${product_skuid}`)
        .then(response => {
            if (response.data) {
                // Transform backend response to match frontend expectations
                // The backend returns { success: true, data: { ...product } }
                const productData = response.data.data || response.data;
                return {
                    data: {
                        status: true,
                        data: productData
                    }
                };
            }
            return { data: { status: false, message: "Product not found" } };
        })
        .catch(error => {
            console.error("Error fetching product details:", error);
            return { data: { status: false, message: "Error fetching product" } };
        });
}

// REAL: Place Order
export const placeOrder = async (data: any) => {
    try {
        // Get cart data to send with order
        const cartResponse = await getCart({});
        let cartItems = cartResponse?.data?.cart || [];

        // ENRICH WITH PRESCRIPTIONS: Safety measure to ensure prescriptions are included in order data
        let prescriptionsForMetadata: any[] = [];
        try {
            const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
            const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
            
            cartItems = cartItems.map((item: any) => {
                // Check original item prescription
                if (item.prescription && Object.keys(item.prescription).length > 0) {
                    prescriptionsForMetadata.push({
                        cart_id: item.cart_id,
                        product_name: item.name,
                        prescription: item.prescription
                    });
                    return item;
                }

                // 1. Try to match by cart_id in localStorage
                let match = savedPrescriptions.find((p: any) => {
                    const pCartId = p?.associatedProduct?.cartId || p?.data?.associatedProduct?.cartId;
                    return pCartId && String(pCartId) === String(item.cart_id);
                });

                // 2. Try to match by product skuid in sessionStorage if cart match fails
                if (!match) {
                    const skuid = item.product?.products?.skuid || item.product?.skuid;
                    if (skuid && sessionPrescriptions[skuid]) {
                        match = sessionPrescriptions[skuid];
                    }
                }

                if (match) {
                    console.log("✓ Found prescription match for cart item:", item.cart_id);
                    const prescriptionData = match.prescriptionDetails || match.data || match;
                    prescriptionsForMetadata.push({
                        cart_id: item.cart_id,
                        product_name: item.name,
                        prescription: prescriptionData
                    });
                    return {
                        ...item,
                        prescription: prescriptionData
                    };
                }
                return item;
            });
        } catch (enrichError) {
            console.warn("Failed to enrich cart items with prescriptions during order placement:", enrichError);
        }

        // Get user profile for addresses
        const profileResponse = await getProfile();
        const profileData = profileResponse?.data?.data || profileResponse?.data || {};

        const shipping_address = profileData.shipping_address || "";
        const billing_address = profileData.billing_address || "";

        // Prepare order data
        const orderData = {
            cart_items: cartItems,
            payment_data: {
                pay_mode: data.pay_mode == 100 || data.pay_mode == '100' ? 'Cash On Delivery' : 'Stripe / Online',
                payment_status: data.pay_mode == 100 || data.pay_mode == '100' ? 'Pending' : 'Success',
                transaction_id: data.transaction_id || null,
                payment_intent_id: data.payment_intent_id || null,
                is_partial: data.is_partial || false
            },
            shipping_address,
            billing_address,
            metadata: {
                customer_id: data.customer_id,
                prescriptions: JSON.stringify(prescriptionsForMetadata) // Explicitly add to metadata root too
            }
        };

        const response = await axios.post('/api/v1/orders', orderData);

        if (response.data?.success) {
            return {
                data: {
                    status: true,
                    order_id: response.data.order_id,
                    message: response.data.message || "Order placed successfully"
                }
            };
        }

        return {
            data: {
                status: false,
                message: "Failed to place order"
            }
        };
    } catch (error: any) {
        console.error("Error placing order:", error);
        return {
            data: {
                status: false,
                message: error?.response?.data?.detail || "Failed to place order"
            }
        };
    }
}

// MOCKED: Pay Partial
export const payPartialAmount = (data: any) => {
    // return axios.post('/retailer/pay-partial', data);
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    status: true,
                    order_id: data.order_id,
                    invoice_no: `INV-PART-${Math.floor(Math.random() * 10000)}`,
                    message: "Partial payment successful"
                }
            });
        }, 1000);
    });
}

// REAL: Get Orders
export const getOrders = () => {
    return axios.get('/api/v1/orders')
        .then(response => {
            if (response.data?.success) {
                return {
                    data: {
                        status: true,
                        orders: response.data.orders || []
                    }
                };
            }
            return { data: { status: false, orders: [] } };
        })
        .catch(error => {
            console.error("Error fetching orders:", error);
            return { data: { status: false, orders: [] } };
        });
}

// REAL: Get Order Details
export const getOrderDetails = (params: any) => {
    return axios.get(`/api/v1/orders/${params.order_id}`)
        .then(response => {
            if (response.data?.success) {
                return {
                    data: {
                        status: true,
                        order: response.data.order
                    }
                };
            }
            return { data: { status: false, order: null } };
        })
        .catch(error => {
            console.error("Error fetching order details:", error);
            return { data: { status: false, order: null } };
        });
}

// MOCKED: Payment Modes
export const getPaymentModes = () => {
    // return axios.get('/retailer/payment-modes');
    return Promise.resolve({
        data: {
            status: true,
            pay_modes: [
                { id: 1, code: 100, name: 'Cash on Delivery', image_url: 'https://cdn-icons-png.flaticon.com/512/2331/2331941.png' },
                { id: 2, code: 200, name: 'Credit/Debit Card (Stripe)', image_url: 'https://cdn-icons-png.flaticon.com/512/179/179457.png' }
            ]
        }
    });
}

export const getPaymentStatus = (uuid: any) => {
    // Use backend API prefix so dev proxy routes to http://localhost:5000
    return axios.get('/api/v1/payment/status/' + uuid)
}

export const getThankYou = (order_id: any) => {
    return axios.get(`/api/v1/orders/thank-you/${order_id}`)
        .then(response => {
            if (response.data && response.data.status) {
                return { data: response.data };
            }
            return { data: { status: false } };
        })
        .catch(error => {
            console.error("Error fetching thank you data:", error);
            return { data: { status: false } };
        });
}

export const sendInvoice = (data: any) => {
    // return axios.post('/retailer/send-invoice', data);
    return Promise.resolve({ data: { status: true } });
}

export const getProfile = () => {
    return axios.get('/api/profile')
}

export const updateProfile = (data: any) => {
    console.log('ðŸ“¤ API: Sending profile update:', data);

    // Backend expects these exact field names (snake_case)
    const payload = {
        first_name: data.first_name || data.firstName,
        last_name: data.last_name || data.lastName,
        mobile: data.mobile,
        country_code: data.country_code,
        gender: data.gender,
        birth_date: data.birth_date || data.day,
        birth_month: data.birth_month || data.month,
        birth_year: data.birth_year || data.year,
        billing_address: data.billing_address || data.billingAddress,
        shipping_address: data.shipping_address || data.shippingAddress,
        address: data.address
    };

    // Remove undefined/null values
    Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
            delete payload[key];
        }
    });

    console.log('ðŸ“¦ API: Cleaned payload:', payload);

    return axios.put('/api/v1/user/profile', payload)
        .then(response => {
            console.log('âœ… API: Success response:', response.data);
            return response;
        })
        .catch(error => {
            console.error('âŒ API: Error response:', error.response?.data || error);
            throw error;
        });
}

// export const updateProfile = (data: any) => {
//     // Backend expects these exact field names (snake_case)
//     const payload = {
//         first_name: data.first_name || data.firstName,
//         last_name: data.last_name || data.lastName,
//         mobile: data.mobile,
//         country_code: data.country_code,
//         gender: data.gender,
//         birth_date: data.birth_date || data.day,
//         birth_month: data.birth_month || data.month,
//         birth_year: data.birth_year || data.year
//     };

//     // Remove undefined values
//     Object.keys(payload).forEach(key => {
//         if (payload[key] === undefined) {
//             delete payload[key];
//         }
//     });

//     return axios.put('/api/v1/user/profile', payload);
// }




export const logOut = () => {
    return axios.post('/accounts/logout')
}

export const getAppoitments = () => {
    // return axios.get('/retailer/appointments');
    return Promise.resolve({
        data: {
            success: true,
            data: [
                { id: 1, name: "Alice Smith", email: "alice@example.com", phone_number: "+1234567890", date_of_slot: "2023-12-01", start_slot_time: "10:00", end_slot_time: "11:00", gender: "F", service: "Eye Checkup", status: true, store__store_name: "London Store" },
                { id: 2, name: "Bob Jones", email: "bob@example.com", phone_number: "+0987654321", date_of_slot: "2023-12-05", start_slot_time: "14:00", end_slot_time: "15:00", gender: "M", service: "Consultation", status: true, store__store_name: "London Store" }
            ]
        }
    });
}

export const cancelAppoitment = (data: any) => {
    return axios.post('/retailer/cancel-appointment', data)
}

export const getQuestions = () => {
    return axios.get('/retailer/quiz-questions');
}

export const submitQuiz = (status: string, questionId: string | number, customerId: string | null) => {
    return axios.post('/retailer/submit-quiz', { status, questionId, customerId });
}

// Offers - Using backend coupon system instead
// Use applyCoupon and removeCoupon functions below for coupon functionality

export const createPaymentSession = (data: any) => {
    return axios.post('/api/v1/payment/create-session', data);
};

// REAL: Apply Coupon (Hybrid)
export const applyCoupon = (code: string) => {
    return axios.post('/api/v1/cart/coupon', { code });
};

// REAL: Remove Coupon (Hybrid)
export const removeCoupon = () => {
    return axios.delete('/api/v1/cart/coupon');
};

// REAL: Update Shipping (Hybrid)
export const updateShippingMethod = (method_id: string) => {
    return axios.put('/api/v1/cart/shipping', { method_id });
};

export const forgotPassword = (data: { email: string }) => {
    return axios.post('/api/v1/auth/forgot-password', data);
};

// --- RECENTLY VIEWED ---
export const getRecentlyViewed = () => {
    return axios.get('/api/v1/products/recently-viewed');
};

export const addRecentlyViewed = (product_id: string) => {
    return axios.post('/api/v1/products/recently-viewed', { product_id });
};

// --- MY PRESCRIPTIONS ---
export const getMyPrescriptions = () => {
    return axios.get('/api/v1/user/prescriptions');
};

// Upload prescription image to Google Cloud Storage
export const uploadPrescriptionImage = (file: File, userId?: string, guestId?: string) => {
    const formData = new FormData();
    // Backend expects: body -> file (UploadFile)
    formData.append('file', file, file.name);

    // Some backends also accept "image" — harmless extra for compatibility.
    formData.append('image', file, file.name);

    // Ensure guest_id exists for guest uploads (some backends require it in the body)
    let ensuredGuestId =
        guestId ||
        localStorage.getItem('guest_id') ||
        sessionStorage.getItem('guest_id') ||
        undefined;
    if (!userId && !ensuredGuestId) {
        ensuredGuestId = 'guest_' + Math.random().toString(36).slice(2, 9) + Date.now();
        try {
            localStorage.setItem('guest_id', ensuredGuestId);
        } catch {
            // ignore storage failures (private mode / storage disabled)
        }
    }

    if (userId) formData.append('user_id', userId);
    if (!userId && ensuredGuestId) formData.append('guest_id', ensuredGuestId);

    // Don't set Content-Type manually - let axios set it with the boundary
    return axios.post('/api/v1/prescriptions/upload-image', formData);
};

// Save prescription with optional image URL and guest support
export const saveMyPrescription = (
    type: string,
    data: any,
    name: string = "My Prescription",
    imageUrl?: string,
    guestId?: string
) => {
    return axios.post('/api/v1/user/prescriptions', {
        type,
        data,
        name,
        image_url: imageUrl,
        guest_id: guestId
    });
};

export const updateMyPrescription = (
    prescriptionId: string,
    updates: { associatedProduct?: any }
) => {
    return axios.put(`/api/v1/user/prescriptions/${prescriptionId}`, updates);
};


export const updateMyPrescriptionCartId = (
    prescriptionId: string,
    selectedCartId: string
) => {
    return axios.put(`/api/v1/user/prescriptions/${prescriptionId}`, {
        data: {
            associatedProduct: {
                cartId: selectedCartId
            }
        }
    });
};

export const deletePrescription = (id: string) => {
    return axios.delete(`/api/v1/user/prescriptions/${id}`);
};





// REAL: Get User Addresses (with localStorage fallback)
export const getUserAddresses = () => {
    // First try to get from API
    return axios.get('/api/v1/user/addresses')
        .then(response => {
            if (response.data?.success) {
                // Also store in localStorage for backup
                localStorage.setItem('userAddresses', JSON.stringify(response.data.addresses || []));
                return {
                    data: {
                        status: true,
                        addresses: response.data.addresses || []
                    }
                };
            }
            // If API fails, try to get from localStorage
            const storedAddresses = localStorage.getItem('userAddresses');
            if (storedAddresses) {
                return {
                    data: {
                        status: true,
                        addresses: JSON.parse(storedAddresses)
                    }
                };
            }
            return { data: { status: false, addresses: [] } };
        })
        .catch(error => {
            console.error("Error fetching addresses from API, trying localStorage:", error);
            // Fallback to localStorage
            const storedAddresses = localStorage.getItem('userAddresses');
            if (storedAddresses) {
                return {
                    data: {
                        status: true,
                        addresses: JSON.parse(storedAddresses)
                    }
                };
            }
            return { data: { status: false, addresses: [] } };
        });
}

// REAL: Save User Address (with localStorage backup)
export const saveUserAddress = (addressData: any) => {
    // Backend expects these exact field names
    const payload = {
        full_name: addressData.fullName,
        email: addressData.email,
        mobile: addressData.mobile,
        address_line: addressData.addressLine,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        zip: addressData.zip,
        address_type: addressData.addressType,
        is_default: addressData.isDefaultAddress
    };

    // Try to save to API first
    return axios.post('/api/v1/user/addresses', payload)
        .then(response => {
            if (response.data?.success) {
                // Update localStorage
                const storedAddresses = localStorage.getItem('userAddresses');
                let addresses = storedAddresses ? JSON.parse(storedAddresses) : [];
                
                // If setting as default, remove default flag from others
                if (addressData.isDefaultAddress) {
                    addresses = addresses.map((addr: any) => ({ ...addr, is_default: false }));
                }
                
                // Add or update the address
                const existingIndex = addresses.findIndex((addr: any) => addr.id === response.data.address_id);
                if (existingIndex >= 0) {
                    addresses[existingIndex] = { ...payload, id: response.data.address_id };
                } else {
                    addresses.push({ ...payload, id: response.data.address_id || Date.now().toString() });
                }
                
                localStorage.setItem('userAddresses', JSON.stringify(addresses));
                
                return {
                    data: {
                        status: true,
                        address_id: response.data.address_id,
                        message: response.data.message || "Address saved successfully"
                    }
                };
            }
            // Fallback: save to localStorage only
            const storedAddresses = localStorage.getItem('userAddresses');
            let addresses = storedAddresses ? JSON.parse(storedAddresses) : [];
            
            if (addressData.isDefaultAddress) {
                addresses = addresses.map((addr: any) => ({ ...addr, is_default: false }));
            }
            
            const newAddress = { ...payload, id: Date.now().toString() };
            addresses.push(newAddress);
            
            localStorage.setItem('userAddresses', JSON.stringify(addresses));
            
            return {
                data: {
                    status: true,
                    address_id: newAddress.id,
                    message: "Address saved locally"
                }
            };
        })
        .catch(error => {
            console.error("Error saving address to API, saving to localStorage:", error);
            // Fallback: save to localStorage only
            const storedAddresses = localStorage.getItem('userAddresses');
            let addresses = storedAddresses ? JSON.parse(storedAddresses) : [];
            
            if (addressData.isDefaultAddress) {
                addresses = addresses.map((addr: any) => ({ ...addr, is_default: false }));
            }
            
            const newAddress = { ...payload, id: Date.now().toString() };
            addresses.push(newAddress);
            
            localStorage.setItem('userAddresses', JSON.stringify(addresses));
            
            return {
                data: {
                    status: true,
                    address_id: newAddress.id,
                    message: "Address saved locally"
                }
            };
        });
}

// REAL: Delete User Address (with localStorage sync)
export const deleteUserAddress = (addressId: string) => {
    return axios.delete(`/api/v1/user/addresses/${addressId}`)
        .then(response => {
            if (response.data?.success) {
                // Update localStorage
                const storedAddresses = localStorage.getItem('userAddresses');
                let addresses = storedAddresses ? JSON.parse(storedAddresses) : [];
                addresses = addresses.filter((addr: any) => addr.id !== addressId);
                localStorage.setItem('userAddresses', JSON.stringify(addresses));
                
                return {
                    data: {
                        status: true,
                        message: response.data.message || "Address deleted successfully"
                    }
                };
            }
            return {
                data: {
                    status: false,
                    message: "Failed to delete address"
                }
            };
        })
        .catch(error => {
            console.error("Error deleting address from API, updating localStorage:", error);
            // Fallback: update localStorage only
            const storedAddresses = localStorage.getItem('userAddresses');
            let addresses = storedAddresses ? JSON.parse(storedAddresses) : [];
            addresses = addresses.filter((addr: any) => addr.id !== addressId);
            localStorage.setItem('userAddresses', JSON.stringify(addresses));
            
            return {
                data: {
                    status: true,
                    message: "Address deleted locally"
                }
            };
        });
}
