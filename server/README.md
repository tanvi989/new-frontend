# MultiFolks Backend - MongoDB Setup

## Overview
The backend has been migrated from PostgreSQL to MongoDB Atlas. All user data, login details, cart items, orders, and prescriptions are now stored in MongoDB.

## MongoDB Connection
- **Database**: MongoDB Atlas
- **Connection String**: `mongodb+srv://vacanzidev_db_user:Fxrzcgx34bTWNcIE@gamultilens.tuzaora.mongodb.net/?appName=gaMultilens`
- **Driver**: Mongoose (ODM for MongoDB)

## Collections

### 1. Users
Stores user account information and login credentials.

**Fields**:
- `email` (String, unique, required)
- `password_hash` (String, required) - Bcrypt hashed password
- `firstName` (String)
- `lastName` (String)
- `phone` (String)
- `created_at` (Date)
- `updated_at` (Date)

### 2. Cart Items
Stores shopping cart items for each user.

**Fields**:
- `user_id` (ObjectId, ref: User)
- `product_id` (String)
- `quantity` (Number, min: 1)
- `product_details` (Object)
  - `name` (String)
  - `price` (Number)
  - `image` (String)
  - `frame_color` (String)
  - `lens_type` (String)
- `created_at` (Date)
- `updated_at` (Date)

**Indexes**: Compound unique index on `(user_id, product_id)`

### 3. Orders
Stores all past and current orders.

**Fields**:
- `user_id` (ObjectId, ref: User)
- `order_number` (String, unique) - Format: ORD-{timestamp}-{random}
- `status` (String) - pending, processing, shipped, delivered, cancelled
- `items` (Array of Objects)
  - `product_id` (String)
  - `product_name` (String)
  - `quantity` (Number)
  - `price` (Number)
  - `lens_type` (String)
  - `lens_quality` (String)
  - `frame_color` (String)
  - `prescription` (Object)
- `shipping_address` (Object)
- `billing_address` (Object)
- `total_amount` (Number)
- `payment_method` (String) - credit_card, debit_card, paypal, hsa_fsa
- `payment_status` (String) - pending, paid, failed, refunded
- `tracking_number` (String)
- `notes` (String)
- `created_at` (Date)
- `updated_at` (Date)

### 4. Prescriptions
Stores saved prescription data for users.

**Fields**:
- `user_id` (ObjectId, ref: User)
- `prescription_name` (String)
- `right_eye` (Object)
  - `sphere` (Number)
  - `cylinder` (Number)
  - `axis` (Number)
  - `add` (Number)
  - `prism` (Number)
  - `base` (String)
- `left_eye` (Object) - Same structure as right_eye
- `pupillary_distance` (Number)
- `prescription_file_url` (String)
- `is_active` (Boolean)
- `created_at` (Date)
- `updated_at` (Date)

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/user/profile` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)

### Cart Management
- `GET /api/cart` - Get user's cart items (requires auth)
- `POST /api/cart` - Add/update cart item (requires auth)
- `DELETE /api/cart/:productId` - Remove specific item (requires auth)
- `DELETE /api/cart` - Clear entire cart (requires auth)

### Orders
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders` - Get all user orders (requires auth)
- `GET /api/orders/:orderId` - Get specific order (requires auth)

### Prescriptions
- `POST /api/prescriptions` - Save prescription (requires auth)
- `GET /api/prescriptions` - Get all user prescriptions (requires auth)
- `GET /api/prescriptions/:prescriptionId` - Get specific prescription (requires auth)
- `DELETE /api/prescriptions/:prescriptionId` - Delete prescription (requires auth)

### Health Check
- `GET /api/health` - Check server and database status

## Installation & Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

This will install:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - CORS middleware
- `dotenv` - Environment variables

### 2. Environment Variables
The `.env` file contains:
```
MONGODB_URI=mongodb+srv://vacanzidev_db_user:Fxrzcgx34bTWNcIE@gamultilens.tuzaora.mongodb.net/?appName=gaMultilens
JWT_SECRET=your_jwt_secret_change_this_in_production
PORT=5001
```

⚠️ **Important**: Change `JWT_SECRET` to a strong random string in production!

### 3. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on port 5001 and automatically connect to MongoDB.

## Authentication Flow

1. **Registration**:
   - User submits email and password
   - Password is hashed with bcrypt (10 rounds)
   - User document is created in MongoDB
   - JWT token is generated and returned

2. **Login**:
   - User submits email and password
   - Password is compared with stored hash
   - JWT token is generated and returned (valid for 7 days)

3. **Protected Routes**:
   - Client sends JWT token in `Authorization: Bearer <token>` header
   - Server verifies token and extracts user info
   - Request proceeds with `req.user` containing user data

## Data Migration Notes

If you have existing data in PostgreSQL that needs to be migrated:

1. Export users, carts, and orders from PostgreSQL
2. Transform data to match MongoDB schemas
3. Use MongoDB import tools or write a migration script
4. Verify data integrity after migration

## Security Features

✅ **Password Security**: Bcrypt hashing with salt rounds  
✅ **JWT Authentication**: Secure token-based auth  
✅ **CORS Protection**: Configured CORS middleware  
✅ **Input Validation**: Schema validation via Mongoose  
✅ **Unique Constraints**: Email uniqueness enforced  
✅ **Soft Deletes**: Prescriptions use `is_active` flag  

## Monitoring & Debugging

### Check Database Connection
```bash
curl http://localhost:5001/api/health
```

Response:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2025-11-29T10:00:00.000Z"
}
```

### MongoDB Atlas Dashboard
Access your database at: https://cloud.mongodb.com/

- View collections and documents
- Monitor performance
- Set up alerts
- Configure backups

## Troubleshooting

### Connection Issues
- Verify MongoDB URI is correct
- Check network connectivity
- Ensure IP address is whitelisted in MongoDB Atlas
- Verify database user credentials

### Authentication Errors
- Check JWT_SECRET is set correctly
- Verify token is being sent in Authorization header
- Check token hasn't expired (7 day validity)

### Data Not Saving
- Check Mongoose schema validation errors
- Verify required fields are provided
- Check server logs for detailed error messages

## Next Steps

1. ✅ MongoDB connection configured
2. ✅ User authentication implemented
3. ✅ Cart management ready
4. ✅ Order system in place
5. ✅ Prescription storage ready
6. 🔄 Connect frontend to new API endpoints
7. 🔄 Test all flows end-to-end
8. 🔄 Set up production environment variables
9. 🔄 Configure MongoDB backups
10. 🔄 Add monitoring and logging

## Support

For issues or questions:
- Check server logs: `npm run dev` shows detailed logs
- MongoDB Atlas logs: Available in the Atlas dashboard
- API testing: Use Postman or curl to test endpoints
