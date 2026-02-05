/**
 * Per-product flow state in sessionStorage.
 * Flow: /glasses → /product/:id → select-prescription-type → prescription → select-lens → add to cart
 * Keyed by product id/sku so each product has its own flow state.
 */

const PREFIX = "multifolks_flow_";

function getStorage(): Storage {
  return typeof window !== "undefined" ? sessionStorage : ({} as Storage);
}

export type ProductFlowState = {
  productId: string;
  product?: Record<string, unknown>;
  lensType?: string;
  prescriptionTier?: string;
  prescriptionMethod?: string;
  prescription?: unknown;
  selectedLensPackage?: string;
  selectedLensPrice?: number;
  lensCategory?: string;
  cart_id?: number;
  updatedAt?: number;
  [key: string]: unknown;
};

function flowKey(productId: string): string {
  return `${PREFIX}${productId}`;
}

export function getProductFlow(productId: string): ProductFlowState | null {
  try {
    const raw = getStorage().getItem(flowKey(productId));
    if (!raw) return null;
    return JSON.parse(raw) as ProductFlowState;
  } catch {
    return null;
  }
}

export function setProductFlow(productId: string, data: Partial<ProductFlowState>): void {
  try {
    const existing = getProductFlow(productId) || { productId, updatedAt: Date.now() };
    const next = { ...existing, ...data, productId, updatedAt: Date.now() };
    getStorage().setItem(flowKey(productId), JSON.stringify(next));
  } catch (e) {
    console.warn("productFlowStorage setProductFlow failed", e);
  }
}

export function clearProductFlow(productId: string): void {
  try {
    getStorage().removeItem(flowKey(productId));
  } catch {}
}

/** Save product when user selects on /glasses or lands on /product/:id */
export function saveProduct(productId: string, product: Record<string, unknown>): void {
  setProductFlow(productId, { product });
}

/** Save prescription type step */
export function savePrescriptionType(
  productId: string,
  opts: { lensType?: string; prescriptionTier?: string; [k: string]: unknown }
): void {
  setProductFlow(productId, opts);
}

/** Save prescription step */
export function savePrescription(productId: string, prescription: unknown): void {
  setProductFlow(productId, { prescription });
}

/** Save lens step (package, price, category) */
export function saveLensSelection(
  productId: string,
  opts: {
    selectedLensPackage?: string;
    selectedLensPrice?: number;
    lensCategory?: string;
    [k: string]: unknown;
  }
): void {
  setProductFlow(productId, opts);
}

/** Save cart_id after add to cart */
export function saveCartId(productId: string, cart_id: number): void {
  setProductFlow(productId, { cart_id });
}
