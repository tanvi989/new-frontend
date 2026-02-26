/**
 * Retailer / Cart API - re-exports and axios-based endpoints.
 * syncLocalCartToBackend merges guest cart into user cart after login.
 */
import axios from "./axiosConfig";
import { mergeGuestCartAlternative } from "./cartMergeHelper";

// Re-export: merge guest cart into user cart after login (used by authService, LoginModal, etc.)
export const syncLocalCartToBackend = async (): Promise<void> => {
  await mergeGuestCartAlternative();
};

// --- Cart ---
export const getCart = (params?: any) =>
  axios.get("/api/v1/cart", { params }).then((r) => ({ data: r.data }));

export function getCartItemId(item: any): number | null {
  if (item == null) return null;
  const raw = item.cart_id ?? item.cart_item_id ?? item.id;
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  return Number.isNaN(n) ? null : n;
}

export const deleteProductFromCart = (cart_id: any, _skuid?: any, _from?: any) => {
  const id = typeof cart_id === "number" ? cart_id : parseInt(String(cart_id), 10);
  if (Number.isNaN(id)) return Promise.resolve({ data: { status: false, message: "Invalid cart id" } });
  return axios.delete(`/api/v1/cart/item/${id}`).then((r) => ({ data: r.data }));
};

export const updateCartQuantity = (cart_id: number, quantity: number) =>
  axios.put(`/api/v1/cart/quantity?cart_id=${cart_id}&quantity=${quantity}`).then(() => ({ data: { status: true } }));

export const applyCoupon = (code: string) =>
  axios.post("/api/v1/cart/coupon", { code }).then((r) => ({ data: r.data }));

export const removeCoupon = () =>
  axios.delete("/api/v1/cart/coupon").then((r) => ({ data: r.data }));

export const updateShippingMethod = (methodId: string) =>
  axios.put("/api/v1/cart/shipping", { method_id: methodId }).then((r) => ({ data: r.data }));

// --- Prescriptions ---
export const getMyPrescriptions = (guestId?: string) => {
  const headers = guestId ? { "X-Guest-ID": guestId } : {};
  return axios.get("/api/v1/user/prescriptions", { headers }).then((r) => ({ data: r.data }));
};

// --- Products ---
export const getFrames = (gender?: string, limit = 1000) => {
  const params: any = { limit };
  if (gender) params.gender = gender;
  return axios.get("/api/v1/products/all", { params }).then((r) => {
    if (r.data?.products) return { ...r, data: { ...r.data, data: r.data.products } };
    return r;
  });
};

export const getAllProducts = (params: any) =>
  axios.get("/api/v1/products", { params });

export const getProductById = (id: string) => axios.get(`/api/v1/products/${id}`);
export const getProductBySku = (sku: string) => axios.get(`/api/v1/products/sku/${sku}`);

export const getProductDetails = (product_skuid: any, _color?: any, _size?: any) =>
  axios.get(`/api/v1/products/sku/${product_skuid}`).then((r) => ({ data: { status: true, data: r.data?.data ?? r.data } }));

// --- Add to cart / lens / prescription ---
export const addToCart = (products: any, flag: any, prescription?: any, options?: any) => {
  const productId = products.skuid ?? products.id ?? "";
  const itemData: any = {
    product_id: productId,
    name: products.name ?? products.product_name,
    image: products.image,
    price: products.price ?? products.list_price ?? 0,
    quantity: 1,
    product: { products: { ...products, list_price: products.list_price ?? products.price, price: products.price ?? products.list_price } },
    lens: options?.lens ?? {},
    prescription: prescription ?? undefined,
    flag: flag ?? "normal",
  };
  if (options?.product_details) itemData.product_details = options.product_details;
  return axios.post("/api/v1/cart/add", itemData).then((r) => ({ ...r, data: { ...r.data, status: true, success: true } }));
};

export const selectLens = (skuid: string, cart_id: number, lens_id: string | number, lensDetails?: any) => {
  const lensData: any = {
    id: lens_id,
    sub_category: lensDetails?.title ?? "Premium Lens",
    main_category: lensDetails?.main_category ?? "Progressive",
    selling_price: lensDetails?.lensPackagePrice ?? lensDetails?.priceValue ?? 0,
    price: lensDetails?.lensPackagePrice ?? lensDetails?.priceValue ?? 0,
    coating: lensDetails?.title?.includes("Coating") || lensDetails?.title?.includes("Resistant") ? lensDetails.title : undefined,
    coating_price: lensDetails?.priceValue ?? 0,
  };
  return axios.put("/api/v1/cart/lens", { cart_id, lens_data: lensData }).then(() => ({ data: { status: true } }));
};

export const addPrescription = (_customer_id: any, _type: any, _mode: any, data: any, cart_id: any) => {
  const formData = new FormData();
  if (cart_id) formData.append("cart_id", String(cart_id));
  formData.append("mode", _mode || "manual");  // Use the actual mode parameter
  formData.append("prescription_data", JSON.stringify({ type: _type || "manual", mode: _mode || "manual", data: data?.data ?? data }));
  return axios.put("/api/v1/cart/prescription", formData);
};

export const removePrescription = (cart_id: any) => {
  const formData = new FormData();
  formData.append("cart_id", String(cart_id));
  formData.append("mode", "manual");
  formData.append("prescription_data", "{}");
  return axios.put("/api/v1/cart/prescription", formData);
};

/** Save lens, prescription, product_details (PD) into guest cart in DB before merge. Call after login with token. */
export const saveGuestCartState = (
  guestId: string,
  items: { cart_id: number; lens?: Record<string, unknown>; prescription?: Record<string, unknown>; product_details?: Record<string, unknown> }[]
) =>
  axios.post("/api/v1/cart/save-guest-cart-state", { guest_id: guestId, items }).then((r) => r.data);

/** Merge guest cart into current user cart (requires token). Backend copies all item data including lens, prescription, product_details. */
export const mergeGuestCart = (guestId: string) =>
  axios.post("/api/v1/cart/merge-guest-cart", { guest_id: guestId }).then((r) => r.data);

export const deletePrescription = (id: string) => axios.delete(`/api/v1/user/prescriptions/${id}`);

// --- Orders ---
export const getOrders = () => axios.get("/api/v1/orders").then((r) => ({ data: r.data }));
export const clearCart = () => axios.delete("/api/v1/cart/clear").then(() => ({ data: { status: true } }));

export const updateOrderWithCart = (orderId: string, payload: { cart_items?: any; subtotal?: number; discount_amount?: number; shipping_cost?: number; total_payable?: number }) =>
  axios.patch(`/api/v1/orders/${orderId}`, payload).then((r) => ({ data: r.data }));

export const getThankYou = (orderId: string) => axios.get(`/api/v1/orders/thank-you/${orderId}`).then((r) => ({ data: r.data }));

// --- Profile / Auth ---
export const getProfile = () => axios.get("/api/profile").then((r) => ({ data: r.data }));
export const updateProfile = (data: any) => axios.put("/api/v1/user/profile", data).then((r) => ({ data: r.data }));

export const isLoggedIn = () => typeof window !== "undefined" && !!localStorage.getItem("token");

export const logOut = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    window.dispatchEvent(new Event("auth-change"));
  }
};

// --- Sign up / OTP ---
export const isRegisteredUser = (data: any) => Promise.resolve({ data: { status: true, data: { is_registered: false } } });
export const validateCustomer = (data: any) =>
  new Promise((resolve) => setTimeout(() => resolve({ data: { status: true, customer: { id: "MOCK", first_name: data?.first_name, email: data?.email }, access_token: "mock-" + Date.now() } }), 50));

// --- Prescription upload / save ---
export const saveMyPrescription = (data: any) => axios.post("/api/v1/user/prescriptions", data).then((r) => ({ data: r.data }));
/** Upload prescription image to GCS. Backend expects form field "file" (required). */
export const uploadPrescriptionImage = (
  fileOrFormData: File | FormData,
  userId?: string,
  guestId?: string,
  productId?: string
) => {
  let form: FormData;
  if (fileOrFormData instanceof FormData) {
    form = fileOrFormData;
    if (!form.has("file")) throw new Error("FormData must include a 'file' field");
  } else {
    form = new FormData();
    form.append("file", fileOrFormData, fileOrFormData.name || "prescription.jpg");
    if (userId) form.append("user_id", userId);
    if (guestId) form.append("guest_id", guestId);
    if (productId) form.append("product_id", productId);
  }
  return axios.post("/api/v1/prescriptions/upload-image", form).then((r) => ({ data: r.data }));
};

// --- Recently viewed ---
export const getRecentlyViewed = () => axios.get("/api/v1/products/recently-viewed").then((r) => ({ data: r.data }));
export const addRecentlyViewed = (skuIds: string[]) => axios.post("/api/v1/products/recently-viewed", { sku_ids: skuIds }).then((r) => ({ data: r.data }));

// --- VTO ---
export const VTO_IMAGE_BASE = "https://storage.googleapis.com/myapp-image-bucket-001/vto/vto_ready";
export const getVtoImageUrl = (skuid: string) => `${VTO_IMAGE_BASE}/${skuid}_VTO.png`;

// --- Payment / Thanks ---
export const getPaymentStatus = (sessionId: string) => Promise.resolve({ data: { status: true } });
export const sendInvoice = (orderId: string) => axios.post(`/api/v1/orders/${orderId}/send-confirmation-email`).then((r) => ({ data: r.data }));

// --- Other stubs ---
export const updateInventory = (data: any) => axios.put("/retailer/product-inventory", data);
export const addLensDiscount = () => Promise.resolve({ data: { status: true } });
export const removeDiscount = () => Promise.resolve({ data: { status: true } });
export const updateMyPrescription = (id: string, data: any) => axios.put(`/api/v1/user/prescriptions/${id}`, data).then((r) => ({ data: r.data }));
export const eyeCheckup = () => axios.get("/retailer/eye-checkup");
export const createEyeCheckup = (data: any) => axios.post("/retailer/eye-checkup", { data });
export const answerQuestion = (params: any) => axios.post("/retailer/answer-question", params);
export const getQuestion = (params: any) => axios.get("/retailer/get-question", { params });
export const getCustomers = () => axios.get("/retailer/customers");
export const getCustomerDetails = (params: any) => axios.get("/retailer/customers", { params });
export const getAppoitments = () => axios.get("/retailer/eye-checkup");
export const cancelAppoitment = (id: string) => Promise.resolve({ data: { status: true } });
export const getQuestions = () => Promise.resolve({ data: [] });
export const submitQuiz = (data: any) => Promise.resolve({ data: { status: true } });

// --- Payment / Checkout ---
export const getPaymentModes = () => Promise.resolve({ data: { modes: [] } });
export const payPartialAmount = (_orderId: string, _amount: number) => Promise.resolve({ data: { status: true } });
export const placeOrder = (data: any) => axios.post("/api/v1/orders", data).then((r) => ({ data: r.data }));
export const createPaymentSession = (data: any) => axios.post("/api/v1/payment/create-session", data).then((r) => ({ data: r.data }));
export const getUserAddresses = () => Promise.resolve({ data: { addresses: [] } });
export const saveUserAddress = (data: any) => Promise.resolve({ data: { status: true } });
export const deleteUserAddress = (id: string) => Promise.resolve({ data: { status: true } });
export const updateUserAddress = (id: string, data: any) => Promise.resolve({ data: { status: true } });

// --- Order details ---
export const getOrderDetails = (orderId: string) => axios.get(`/api/v1/orders/${orderId}`).then((r) => ({ data: r.data }));

// --- Order confirmation email ---
export const sendOrderConfirmationEmail = async (orderId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const authToken = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
    console.log('[sendConfirmationEmail] Using auth token:', authToken ? 'Present' : 'Missing');
    
    const response = await axios.post(`/api/v1/orders/${orderId}/send-confirmation-email`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken,
      },
    });
    
    if (response.data?.success) {
      console.log('[sendConfirmationEmail] Order confirmation email sent successfully');
      return { success: true, message: 'Confirmation email sent' };
    } else {
      console.error('[sendConfirmationEmail] Failed to send confirmation email:', response.data);
      return { success: false, message: response.data?.message || 'Failed to send email' };
    }
  } catch (error) {
    console.error('[sendConfirmationEmail] Error sending confirmation email:', error);
    return { success: false, message: 'Error sending confirmation email' };
  }
};

// --- Cart prescription link ---
export const updateMyPrescriptionCartId = (prescriptionId: string, cartId: number) =>
  axios.put(`/api/v1/user/prescriptions/${prescriptionId}`, { associatedProduct: { cartId } }).then((r) => ({ data: r.data }));
