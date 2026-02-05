import axios from '../api/axiosConfig';

export const cartService = {
    getCart: async () => {
        // Use backend API (proxied in dev): /api/v1 -> http://localhost:5000/v1
        const response = await axios.get('/api/v1/cart');
        return response.data;
    },

    addToCart: async (productId: string, quantity: number, product_details?: any) => {
        // Backend cart add endpoint used across the app
        const response = await axios.post('/api/v1/cart/add', {
            product_id: productId,
            quantity,
            product_details,
        });
        return response.data;
    },

    updateCartItem: async (productId: string, quantity: number) => {
        // Treat productId as cart_id (legacy helper). Prefer using updateCartQuantity(cart_id, qty).
        const response = await axios.put(`/api/v1/cart/quantity?cart_id=${encodeURIComponent(productId)}&quantity=${encodeURIComponent(String(quantity))}`);
        return response.data;
    },

    removeFromCart: async (productId: string) => {
        // Treat productId as cart_id (legacy helper). Prefer using deleteProductFromCart(cart_id).
        const response = await axios.delete(`/api/v1/cart/item/${encodeURIComponent(productId)}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await axios.delete('/api/v1/cart/clear');
        return response.data;
    }
};
