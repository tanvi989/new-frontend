# Quick Fix: Add Missing Events

In `api/retailerApis.ts`, around line 361-362, you have:

```typescript
window.dispatchEvent(new Event('cart-updated'));
console.log('📢 Dispatched cart-updated event');
```

**Add these two lines right after:**

```typescript
window.dispatchEvent(new Event('auth-change'));
window.dispatchEvent(new Event('cart-merge-complete'));
```

**Final result should be:**

```typescript
window.dispatchEvent(new Event('cart-updated'));
window.dispatchEvent(new Event('auth-change'));
window.dispatchEvent(new Event('cart-merge-complete'));
console.log('📢 Dispatched cart refresh and merge complete events');
```

That's it! The loader will now show and hide properly.
