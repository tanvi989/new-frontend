/**
 * GA4 / GTM e-commerce event tracking via dataLayer.
 * Configure GTM to fire GA4 tags on these events.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

type GA4Item = {
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
};

function ensureDataLayer() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
}

function toGA4Item(p: {
  skuid?: string;
  id?: string | number;
  name?: string;
  brand?: string;
  price?: string | number;
  frameColor?: string;
  item_variant?: string;
  quantity?: number;
}): GA4Item {
  const price = typeof p.price === "string" ? parseFloat(p.price.replace(/[^0-9.]/g, "")) || 0 : Number(p.price) || 0;
  return {
    item_id: p.skuid || String(p.id || ""),
    item_name: p.name,
    item_brand: p.brand,
    price,
    quantity: p.quantity ?? 1,
    item_variant: p.frameColor || p.item_variant,
  };
}

export function trackViewItemList(products: Record<string, unknown>[], listId?: string, listName?: string) {
  ensureDataLayer();
  const items: GA4Item[] = (products || []).slice(0, 50).map((p: any) => toGA4Item(p));
  window.dataLayer!.push({
    event: "view_item_list",
    ecommerce: {
      item_list_id: listId || "product_list",
      item_list_name: listName || "Product List",
      items,
    },
  });
}

export function trackViewItem(product: Record<string, unknown>) {
  ensureDataLayer();
  const p = product as any;
  const item = toGA4Item(p);
  window.dataLayer!.push({
    event: "view_item",
    ecommerce: {
      currency: "GBP",
      value: item.price,
      items: [item],
    },
  });
}

export function trackAddToCart(product: Record<string, unknown>, quantity = 1) {
  ensureDataLayer();
  const p = product as any;
  const item = toGA4Item({ ...p, quantity });
  window.dataLayer!.push({
    event: "add_to_cart",
    ecommerce: {
      currency: "GBP",
      value: (item.price || 0) * quantity,
      items: [item],
    },
  });
}

/** Map cart API item (CartItem) to GA4 format */
function mapCartItemToProduct(item: any): Record<string, unknown> {
  const p = item?.product?.products || item?.product || {};
  const qty = item?.quantity ?? 1;
  const price = p?.price ?? p?.list_price ?? 0;
  return {
    skuid: p?.skuid ?? p?.store_skuid ?? item?.product_id,
    id: p?.skuid ?? item?.product_id,
    name: p?.name ?? p?.naming_system,
    brand: p?.brand,
    price: typeof price === "number" ? price : parseFloat(String(price)) || 0,
    quantity: qty,
  };
}

export function trackBeginCheckout(cartItems: Array<Record<string, unknown>>) {
  ensureDataLayer();
  const items: GA4Item[] = (cartItems || []).map((item: any) =>
    item?.product?.products ? toGA4Item(mapCartItemToProduct(item)) : toGA4Item(item)
  );
  const value = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  window.dataLayer!.push({
    event: "begin_checkout",
    ecommerce: {
      currency: "GBP",
      value,
      items,
    },
  });
}

export function trackPurchase(orderData: {
  transaction_id?: string;
  value?: number;
  currency?: string;
  items?: Array<Record<string, unknown>>;
  shipping?: number;
  tax?: number;
}) {
  ensureDataLayer();
  const items: GA4Item[] = (orderData.items || []).map((p: any) => toGA4Item(p));
  window.dataLayer!.push({
    event: "purchase",
    ecommerce: {
      transaction_id: orderData.transaction_id || `ord_${Date.now()}`,
      value: orderData.value ?? 0,
      currency: orderData.currency || "GBP",
      shipping: orderData.shipping ?? 0,
      tax: orderData.tax ?? 0,
      items,
    },
  });
}
