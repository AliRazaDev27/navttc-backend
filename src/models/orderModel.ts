import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  // We snapshot the name/image to display them even if the product is deleted later
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true }, // Price at moment of purchase
  
  // CLOTHING SPECIFIC FIELDS
  size: { type: String, required: true }, // e.g., 'M', 'XL', 'US 10'
  color: { type: String, required: true }, // e.g., 'Navy Blue', '#000080'
  sku: { type: String }, // Stock Keeping Unit for warehouse tracking
  
  // Reference to the actual product
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true } // Courier usually needs this
    },
    
    paymentMethod: {
      type: String,
      required: true,
    },
    
    // Stores response from Stripe/PayPal/Razorpay
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },

    // FINANCIALS
    // It is best practice to store these as separate fields rather than calculating on the fly
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    // ORDER STATUS
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Pending'
    },
    
    // For shipping tracking
    trackingNumber: { type: String },
    courierName: { type: String }
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  }
);

// Indexing for performance (e.g., "Show me all orders by User X" or "Show me all Pending orders")
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;