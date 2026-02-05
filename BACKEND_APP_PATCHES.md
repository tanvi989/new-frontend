# Backend app.py – Fixes for Prescriptions & Duplicates

Apply these changes in your FastAPI backend (`app.py`).

---

## 1. Add `prescriptions` to CreatePaymentSessionRequest

**Find:**
```python
class CreatePaymentSessionRequest(BaseModel):
    order_id: str
    amount: float
    currency: str = "GBP"
    metadata: Optional[Dict[str, Any]] = None
```

**Replace with:**
```python
class CreatePaymentSessionRequest(BaseModel):
    order_id: str
    amount: float
    currency: str = "GBP"
    metadata: Optional[Dict[str, Any]] = None
    prescriptions: Optional[List[Dict[str, Any]]] = None  # Full prescription per cart item from frontend
```

---

## 2. Use `prescriptions` in the long create_payment_session (order creation)

**Find (inside the first/long `create_payment_session` handler):**
```python
        logger.info(f"📍 Shipping Address: {address_shipping}")
        logger.info(f"📍 Billing Address: {address_billing}")
                
        # 2. Create Order in Database (Status: Pending)
        ...
        metadata=metadata
        )
```

**Do two edits:**

**(A) Right after the billing address log, add:**
```python
        # Merge full prescriptions from frontend into metadata so order stores them
        prescriptions_from_request = getattr(request, "prescriptions", None) or []
        if prescriptions_from_request:
            logger.info(f"📋 Including {len(prescriptions_from_request)} prescription(s) in order")
            order_metadata = {**(metadata or {}), "prescriptions": prescriptions_from_request}
        else:
            order_metadata = metadata
```

**(B) In the `order_service.create_order(...)` call, change the last argument from `metadata=metadata` to `metadata=order_metadata`.**

---

## 3. Remove the duplicate short create_payment_session

You have **two** handlers for `POST /api/v1/payment/create-session`. The second one overwrites the first, so the one that creates the order and uses the cart never runs.

**Delete the entire second block** (the short one), from:

```python
# ---------- PAYMENT ENDPOINTS ----------
@app.post("/api/v1/payment/create-session")
async def create_payment_session(request: CreatePaymentSessionRequest, current_user: dict = Depends(verify_token)):
    if not payment_service:
        raise HTTPException(status_code=503, detail="Payment or Order service unavailable")
    
    # Ensure user_id matches token
    user_id = str(current_user['_id'])
    user_email = current_user['email']
    
    result = payment_service.create_checkout_session(
        order_id=request.order_id,
        amount=request.amount,
        user_email=user_email,
        user_id=user_id,
        metadata=request.metadata
    )
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result)
        
    return result
```

Remove that entire second `@app.post("/api/v1/payment/create-session")` function so only the **first** (long) implementation remains.

---

## 4. Allow guest prescription save (optional auth for POST prescription)

**Option A – Keep token required (simplest):**  
No change; guests will only have prescriptions in localStorage. Frontend already handles API errors and still saves locally.

**Option B – Allow guests to save in DB:**  
Use a dependency that accepts either Bearer token or `guest_id` in body, and store guest prescriptions in a separate collection (e.g. `guest_prescriptions` keyed by `guest_id`). Then in `save_user_prescription`, if `current_user` is a guest, write to that collection instead of `users_collection`. (Requires adding a new collection and wiring it in.)

For now, **no change** is required if you only need logged-in users to persist prescriptions in DB.

---

## 5. Remove duplicate GET/POST /api/v1/user/prescriptions (bottom of file)

You have **two** definitions each for:

- `GET /api/v1/user/prescriptions`
- `POST /api/v1/user/prescriptions`

The **first** (earlier in the file) uses `verify_token` and `current_user.get('prescriptions', [])` / `$push` to `prescriptions`.  
The **second** (near the end) uses `token: str = Depends(security)` and `saved_prescriptions`.

**Delete the second pair** (the one that uses `Depends(security)` and `saved_prescriptions`), i.e. remove:

- The second `@app.get("/api/v1/user/prescriptions")` that uses `get("saved_prescriptions", [])`
- The second `@app.post("/api/v1/user/prescriptions")` that uses `saved_prescriptions` and `PrescriptionData`

Keep the **first** GET/POST that use `verify_token` and the `prescriptions` field on the user document.

---

## 6. Fix typo: @@app.post → @app.post

**Find:**
```python
@@app.post("/api/v1/auth/forgot-password")
```

**Replace with:**
```python
@app.post("/api/v1/auth/forgot-password")
```

---

## 7. Remove duplicate return in delivery track

**Find:**
```python
@app.get("/api/v1/delivery/track/{awb_number}")
async def track_shipment(awb_number: str):
    ...
    return delivery_service.get_shipment_status(awb_number)

    return delivery_service.get_shipment_status(awb_number)
```

**Replace with** (single return):
```python
@app.get("/api/v1/delivery/track/{awb_number}")
async def track_shipment(awb_number: str):
    ...
    return delivery_service.get_shipment_status(awb_number)
```

---

## 8. Ensure order_service.create_order stores metadata.prescriptions

In `order_service.create_order`, ensure whatever builds the order document (MongoDB or similar) **persists** the `metadata` dict, including `metadata["prescriptions"]`, so that when you load the order later, `order["metadata"]["prescriptions"]` contains the full prescription list. If you only store a subset of metadata (e.g. Stripe-related keys), add `prescriptions` to the allowed keys and save it.

---

## Summary

| Issue | Action |
|-------|--------|
| Frontend sends `prescriptions` but backend didn't accept it | Add `prescriptions` to `CreatePaymentSessionRequest` and merge into `metadata` before `create_order`. |
| Second create-session overwrote the first (order never created) | Remove the short duplicate `create_payment_session`; keep the long one that creates order + Stripe session. |
| Duplicate GET/POST prescriptions (wrong field name) | Remove the second pair that uses `saved_prescriptions`; keep the one that uses `prescriptions` and `verify_token`. |
| Typo | Change `@@app.post` to `@app.post` for forgot-password. |
| Duplicate return | Remove the extra `return` in `track_shipment`. |

After these changes, when the frontend calls `createPaymentSession` with `prescriptions`, the backend will store them in the order’s metadata and manual prescription data will be present on the order.
