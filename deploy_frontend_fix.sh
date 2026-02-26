#!/bin/bash
echo "=== DEPLOYING FRONTEND TOKEN FIX ==="

# 1. Go to frontend directory
cd /path/to/frontend  # Replace with actual path

# 2. Add changes
git add .

# 3. Commit changes
git commit -m "Fix order confirmation email - correct token key order

- Fix token retrieval order: 'token' first, then 'authToken'
- Match axios config token key ('token')
- Fix both URL-based and sessionStorage-based email calls
- Fix retailerApis token order
- This resolves authentication issue on live server"

# 4. Push to GitHub
git push origin main

# 5. Deploy to live (adjust based on your deployment process)
# npm run build
# or your specific deployment commands

echo "=== FRONTEND FIX DEPLOYED ==="
echo "Now test a payment on live server!"
echo "Expected console output:"
echo "- [PaymentSuccess] Auth Token: Present"
echo "- [PaymentSuccess] Using auth token: Present"
echo "- [PaymentSuccess] Response status: 200"
echo "- [PaymentSuccess] Order confirmation email sent successfully"
