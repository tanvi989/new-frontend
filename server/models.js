const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  product_details: {
    name: String,
    price: Number,
    image: String,
    frame_color: String,
    lens_type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for user_id and product_id
cartItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

// Order Schema
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_number: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  items: [{
    product_id: String,
    product_name: String,
    quantity: Number,
    price: Number,
    lens_type: String,
    lens_quality: String,
    frame_color: String,
    prescription: {
      type: Object,
      default: null
    }
  }],
  shipping_address: {
    street: String,
    city: String,
    state: String,
    zip_code: String,
    country: String
  },
  billing_address: {
    street: String,
    city: String,
    state: String,
    zip_code: String,
    country: String
  },
  total_amount: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'hsa_fsa'],
    default: 'credit_card'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  tracking_number: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Prescription Schema (legacy flat fields for backward compatibility)
const prescriptionLegacySchema = {
  sphere: Number,
  cylinder: Number,
  axis: Number,
  add: Number,
  prism: Number,
  base: String
};

// Prescription Schema - supports both legacy format and full manual/upload payload
const prescriptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // optional when guest_id is set
  },
  guest_id: {
    type: String,
    required: false,
    index: true
  },
  type: {
    type: String,
    enum: ['manual', 'photo', 'upload'],
    default: 'manual'
  },
  name: {
    type: String,
    default: 'My Prescription'
  },
  prescription_name: {
    type: String,
    default: 'My Prescription'
  },
  image_url: {
    type: String,
    default: null
  },
  // Full payload from frontend (manual: od, os, pd, prism, birthYear, etc.)
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  // Legacy fields (for old API)
  right_eye: prescriptionLegacySchema,
  left_eye: prescriptionLegacySchema,
  pupillary_distance: { type: Number, required: false },
  prescription_file_url: { type: String, default: null },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// At least one of user_id or guest_id must be set
prescriptionSchema.pre('validate', function (next) {
  if (!this.user_id && !this.guest_id) {
    next(new Error('Either user_id or guest_id is required'));
  } else {
    next();
  }
});

// Create models
const User = mongoose.model('User', userSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);
const Order = mongoose.model('Order', orderSchema);
const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = {
  User,
  CartItem,
  Order,
  Prescription
};
