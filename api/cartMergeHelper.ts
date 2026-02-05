import axios from './axiosConfig';

/**
 * Alternative cart merge implementation that doesn't require a dedicated backend endpoint.
 * This fetches the guest cart, adds items to user cart, then clears the guest cart.
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

        // Step 1: Fetch guest cart (temporarily remove token to get guest cart)
        const originalToken = axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['Authorization'];

        const guestCartResponse = await axios.get('/api/v1/cart', {
            headers: { 'X-Guest-ID': guestId }
        });

        // Restore token
        if (originalToken) {
            axios.defaults.headers.common['Authorization'] = originalToken;
        }

        const guestCart = guestCartResponse.data?.cart || [];
        console.log(`📦 Found ${guestCart.length} items in guest cart`);

        if (guestCart.length === 0) {
            console.log('✅ No items to merge');
            localStorage.removeItem('guest_id');
            return true;
        }

        // Step 2: Add each item to user cart
        console.log('📦 Adding items to user cart...');
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

                console.log(`   Adding: ${itemData.name}`);
                await axios.post('/api/v1/cart/add', itemData);
                itemsMerged++;
                console.log(`   ✅ Added`);
            } catch (error: any) {
                console.error(`   ❌ Failed:`, error.message);
            }
        }

        console.log(`✅ Merged ${itemsMerged}/${guestCart.length} items`);

        // Step 3: Clear guest cart
        try {
            delete axios.defaults.headers.common['Authorization'];
            await axios.delete('/api/v1/cart/clear', {
                headers: { 'X-Guest-ID': guestId }
            });
            if (originalToken) {
                axios.defaults.headers.common['Authorization'] = originalToken;
            }
            console.log('✅ Guest cart cleared');
        } catch (error: any) {
            console.warn('⚠️  Failed to clear guest cart:', error.message);
        }

        // Step 4: Cleanup
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
