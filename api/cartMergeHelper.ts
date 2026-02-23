import axios from './axiosConfig';
import { saveGuestCartState, mergeGuestCart } from './retailerApis';
import { getCartLensOverride, getCartLensOverrideBySku } from '../utils/priceUtils';
import { getProductFlow } from '../utils/productFlowStorage';

/** Get prescription for a cart item from localStorage/sessionStorage by cartId or productSku */
function getPrescriptionForCartItem(cartId: number, productSku?: string): Record<string, unknown> | null {
  try {
    const localRaw = localStorage.getItem('prescriptions');
    const localList = localRaw ? JSON.parse(localRaw) : [];
    if (Array.isArray(localList)) {
      for (const p of localList) {
        const pCartId = p?.associatedProduct?.cartId ?? p?.data?.associatedProduct?.cartId ?? p?.cartId ?? p?.data?.cartId;
        const pSku = p?.associatedProduct?.productSku ?? p?.data?.associatedProduct?.productSku;
        if ((pCartId != null && String(pCartId) === String(cartId)) || (productSku && pSku === productSku)) {
          return typeof p === 'object' && p !== null ? p as Record<string, unknown> : null;
        }
      }
    }
    const sessionRaw = sessionStorage.getItem('productPrescriptions');
    if (!sessionRaw) return null;
    const sessionPrescriptions = JSON.parse(sessionRaw);
    if (typeof sessionPrescriptions !== 'object') return null;
    for (const key of Object.keys(sessionPrescriptions)) {
      const p = sessionPrescriptions[key];
      const pCartId = p?.associatedProduct?.cartId ?? p?.data?.associatedProduct?.cartId;
      const pSku = p?.associatedProduct?.productSku ?? p?.data?.associatedProduct?.productSku ?? key;
      if ((pCartId != null && String(pCartId) === String(cartId)) || (productSku && String(pSku) === String(productSku))) {
        return typeof p === 'object' && p !== null ? p as Record<string, unknown> : null;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/** Build product_details (PD) from flow for a SKU */
function getProductDetailsFromFlow(productSku: string): Record<string, unknown> | null {
  const flow = getProductFlow(productSku);
  if (!flow) return null;
  const pdSingle = flow.pdSingle != null ? Number(flow.pdSingle) : undefined;
  const pdRight = flow.pdRight != null ? Number(flow.pdRight) : undefined;
  const pdLeft = flow.pdLeft != null ? Number(flow.pdLeft) : undefined;
  if (pdSingle == null && pdRight == null && pdLeft == null) return null;
  const pd: Record<string, unknown> = {};
  if (pdSingle != null) pd.pd_single_mm = pdSingle;
  if (pdRight != null) pd.pd_right_mm = pdRight;
  if (pdLeft != null) pd.pd_left_mm = pdLeft;
  pd.pd_type = pdRight != null && pdLeft != null ? 'dual' : 'single';
  return pd;
}

/** Build backend lens object from cart item or sessionStorage override */
function buildLensForSave(item: any): Record<string, unknown> | undefined {
  const cartId = item.cart_id ?? item.id;
  const sku = item.product?.products?.skuid ?? item.product_id;
  const existing = item.lens && typeof item.lens === 'object' && Object.keys(item.lens).length > 0
    ? item.lens
    : null;
  const override = getCartLensOverride(cartId) ?? (sku ? getCartLensOverrideBySku(String(sku)) : null);
  if (existing && (existing.selling_price != null || existing.coating != null || existing.sub_category)) {
    return existing as Record<string, unknown>;
  }
  if (override) {
    return {
      id: override.lensPackage ?? override.lensType,
      sub_category: override.coatingTitle ?? override.mainCategory ?? 'Premium Lens',
      main_category: override.mainCategory ?? 'Progressive',
      selling_price: override.lensPackagePrice ?? 0,
      coating: override.coatingTitle ?? undefined,
      coating_price: override.coatingPrice ?? 0,
      tint_price: override.tintPrice ?? 0,
    };
  }
  return existing ? (existing as Record<string, unknown>) : undefined;
}

/**
 * Merge guest cart into user cart after login.
 * 1) Fetches guest cart (as guest).
 * 2) Enriches each item with lens/prescription/PD from localStorage/sessionStorage if missing in DB.
 * 3) Saves enriched state to guest cart in DB (save-guest-cart-state).
 * 4) Backend merge copies all data into user cart and clears guest cart.
 */
export const mergeGuestCartAlternative = async (): Promise<boolean> => {
  console.log('🔄 mergeGuestCartAlternative: Starting...');

  try {
    const token = localStorage.getItem('token');
    const guestId = localStorage.getItem('guest_id');

    if (!token || !guestId) {
      console.log('❌ Skipping merge - missing token or guest_id');
      return false;
    }

    console.log(`📦 Fetching guest cart for: ${guestId}`);

    const guestCartResponse = await axios.get('/api/v1/cart', {
      skipAuth: true,
      guestId,
    } as any);

    const guestCart = guestCartResponse.data?.cart || [];
    console.log(`📦 Found ${guestCart.length} items in guest cart`);

    if (guestCart.length === 0) {
      console.log('✅ No items to merge');
      localStorage.removeItem('guest_id');
      return true;
    }

    const enrichedItems: { cart_id: number; lens?: Record<string, unknown>; prescription?: Record<string, unknown>; product_details?: Record<string, unknown> }[] = [];

    for (const item of guestCart) {
      const cartId = item.cart_id ?? item.id;
      const sku = item.product?.products?.skuid ?? item.product_id;
      const lens = buildLensForSave(item);
      const prescription = (item.prescription && typeof item.prescription === 'object' && Object.keys(item.prescription).length > 0)
        ? (item.prescription as Record<string, unknown>)
        : getPrescriptionForCartItem(cartId, sku);
      const productDetails = (item.product_details && typeof item.product_details === 'object' && Object.keys(item.product_details).length > 0)
        ? (item.product_details as Record<string, unknown>)
        : (sku ? getProductDetailsFromFlow(String(sku)) : null);

      enrichedItems.push({
        cart_id: Number(cartId),
        ...(lens && Object.keys(lens).length > 0 ? { lens } : {}),
        ...(prescription && Object.keys(prescription).length > 0 ? { prescription } : {}),
        ...(productDetails && Object.keys(productDetails).length > 0 ? { product_details: productDetails } : {}),
      });
    }

    console.log('📦 Saving guest cart state (lens, prescription, PD) to DB...');
    try {
      await saveGuestCartState(guestId, enrichedItems);
      console.log('✅ Guest cart state saved');
    } catch (e: any) {
      console.warn('⚠️  save-guest-cart-state failed:', e?.message);
    }

    let itemsMerged = 0;
    try {
      const mergeResult = await mergeGuestCart(guestId);
      itemsMerged = mergeResult?.items_merged ?? 0;
      console.log('✅ Backend merge completed, items_merged:', itemsMerged);
    } catch (e: any) {
      console.warn('⚠️  Backend merge failed, falling back to add-each-item:', e?.message);
    }

    if (itemsMerged === 0 && guestCart.length > 0) {
      console.log('📦 Fallback: adding each guest item to user cart via POST /cart/add...');
      for (const item of guestCart) {
        try {
          const itemData: any = {
            product_id: item.product?.products?.skuid || item.product?.products?.id || item.product_id,
            name: item.product?.products?.name || item.name,
            image: item.product?.products?.image || item.image,
            price: item.product?.products?.list_price ?? item.price ?? 0,
            quantity: item.quantity || 1,
            product: item.product,
            lens: item.lens || {},
            prescription: item.prescription,
            flag: item.flag || 'normal',
          };
          if (item.product_details) itemData.product_details = item.product_details;
          if (!itemData.product_id) continue;
          await axios.post('/api/v1/cart/add', itemData);
          itemsMerged++;
        } catch (err: any) {
          console.error('   ❌ Fallback add failed:', err?.message);
        }
      }
      console.log(`📦 Fallback merged ${itemsMerged}/${guestCart.length} items`);
      if (itemsMerged > 0) {
        try {
          await axios.delete('/api/v1/cart/clear', { skipAuth: true, guestId } as any);
        } catch (_) {}
      }
    }

    localStorage.removeItem('guest_id');
    console.log('🗑️  Removed guest_id');

    window.dispatchEvent(new Event('cart-updated'));
    console.log('📢 Dispatched cart-updated event');

    return true;
  } catch (error: any) {
    console.error('❌ Cart merge failed:', error);
    return false;
  }
};
