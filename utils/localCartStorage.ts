/**
 * Local cart fallback when the backend cart API is unavailable.
 * Uses localStorage so cart persists across refreshes and tabs.
 * (Use sessionStorage instead of localStorage below if you want session-only cart.)
 */

const STORAGE_KEY = "multifolks_local_cart";

export type LocalCartItem = {
  cart_id: number;
  product_id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  product?: { products?: Record<string, unknown> };
  lens?: Record<string, unknown>;
  prescription?: unknown;
  product_details?: Record<string, unknown>;
  flag?: string;
  [key: string]: unknown;
};

function getStorage(): Storage {
  return typeof window !== "undefined" ? localStorage : ({} as Storage);
}

export function getLocalCart(): LocalCartItem[] {
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setLocalCart(items: LocalCartItem[]): void {
  try {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("localCartStorage: setLocalCart failed", e);
  }
}

/** Make a JSON-serializable copy (strip functions, symbols, circular refs). */
function sanitizeForStorage<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch {
    return obj;
  }
}

export function addToLocalCart(item: Omit<LocalCartItem, "cart_id">): LocalCartItem {
  const items = getLocalCart();
  const cart_id = Number(Date.now().toString(36).slice(-9)) + items.length;
  const safe = sanitizeForStorage(item);
  const fullItem: LocalCartItem = { ...safe, cart_id };
  items.push(fullItem);
  setLocalCart(items);
  return fullItem;
}

export function removeFromLocalCart(cartId: number | string): void {
  const id = Number(cartId);
  const items = getLocalCart().filter((i) => Number(i.cart_id) !== id);
  setLocalCart(items);
}

export function updateQuantityLocalCart(cartId: number | string, quantity: number): void {
  const id = Number(cartId);
  const items = getLocalCart().map((i) =>
    Number(i.cart_id) === id ? { ...i, quantity: Math.max(1, quantity) } : i
  );
  setLocalCart(items);
}

export function clearLocalCart(): void {
  try {
    getStorage().removeItem(STORAGE_KEY);
  } catch {}
}

/** Build a getCart-style response from local items (for when API fails). */
export function getLocalCartResponse(): { success: true; cart: LocalCartItem[]; total_items: number } {
  const cart = getLocalCart();
  return { success: true, cart, total_items: cart.length };
}
