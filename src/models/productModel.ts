import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // 1. BASIC INFO (Added Validation)
  title: { 
    type: String, 
    required: [true, 'Please enter product name'], 
    trim: true 
  },
  // SEO Friendly URL: 'mens-denim-jacket-blue' instead of 'ID_123'
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  description: { 
    type: String, 
    required: [true, 'Please enter product description'] 
  },
  
  // 2. PRICING
  price: { 
    type: Number, 
    required: [true, 'Please enter product price'], 
    min: 0 
  },
  // Better to store percentage or calculated sale price to avoid frontend math
  discountPercentage: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  }, 

  // 3. CATEGORIZATION
  brand: { type: String, required: true },
  category: { 
    type: String, 
    required: [true, 'Please select category'], // e.g., 'Men', 'Women'
    enum: ['Men', 'Women', 'Kids', 'Unisex'] // Optional: restrict values
  },
  // Renamed 'collection' to 'subCategory' or 'tags' for clarity
  subCategory: { type: String }, // e.g., 'Hoodies', 'T-Shirts'
  tags: [String], // e.g., 'Summer', 'Gym', 'Casual'

  // 4. IMAGES
  thumbnail: { type: String, required: true },
  images: [String],

  // 5. THE VARIANT SOLUTION (Critical for Clothing)
  // This replaces your simple size/color arrays
  variants: [
    {
      color: { type: String, required: true }, // e.g., 'Red'
      colorCode: { type: String }, // e.g., '#FF0000' for UI swatches
      size: { type: String, required: true }, // e.g., 'XL'
      sku: { type: String }, // Unique ID for this specific combo
      stock: { type: Number, required: true, min: 0, default: 0 } // Quantity for Red-XL
    }
  ],

  // 6. REVIEWS & RATING
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: { 
    type: Number, 
    default: 0 
  },
  
  // 7. METADATA
  isFeatured: { type: Boolean, default: false }, // For carousel
  isActive: { type: Boolean, default: true }, // Soft delete
}, 
{ 
  timestamps: true,
  // Enable virtuals to be included in JSON response
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

// VIRTUAL: Calculate final price dynamically
productSchema.virtual('finalPrice').get(function() {
  if (this.discountPercentage > 0) {
    return this.price - (this.price * (this.discountPercentage / 100));
  }
  return this.price;
});

// VIRTUAL: Calculate total stock across all variants
productSchema.virtual('totalStock').get(function() {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((acc, item) => acc + item.stock, 0);
  }
  return 0;
});

// INDEXES (For fast searching/filtering)
productSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Enable search
productSchema.index({ category: 1 });
productSchema.index({ 'variants.stock': 1 }); // To quickly find in-stock items

const Product = mongoose.model('Product', productSchema);

export default Product;