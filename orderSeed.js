import { faker } from '@faker-js/faker';
import Order from './src/models/orderModel.ts'; // Adjust path
import User from './src/models/userModel.ts';   // Adjust path
import Product from './src/models/productModel.ts'; // Adjust path
import dotenv from 'dotenv';
import db from "./src/config/db.ts";

dotenv.config();
db(); // Initialize DB connection

// Configuration
const ORDERS_TO_CREATE = 50; 
const TAX_RATE = 0.10; // 10% Tax

const seedOrders = async () => {
  try {
    // 1. Fetch dependencies
    const users = await User.find();
    const products = await Product.find();

    if (users.length === 0 || products.length === 0) {
      console.error('Error: You must seed Users and Products before seeding Orders.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users and ${products.length} products. Generating orders...`);

    // 2. Clear existing orders (Optional)
    await Order.deleteMany({});
    console.log('Existing orders cleared.');

    const ordersBuffer = [];

    // 3. Loop to create orders
    for (let i = 0; i < ORDERS_TO_CREATE; i++) {
      
      // A. Pick a random User
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // B. Generate Random Order Items (1 to 4 items per order)
      const numberOfItems = Math.floor(Math.random() * 4) + 1;
      const orderItems = [];

      for (let j = 0; j < numberOfItems; j++) {
        // Pick random product
        const product = products[Math.floor(Math.random() * products.length)];
        
        // Pick a random variant (CRITICAL for your clothing schema)
        // Fallback if variants array is empty, though your schema suggests it shouldn't be
        const variant = product.variants && product.variants.length > 0 
          ? product.variants[Math.floor(Math.random() * product.variants.length)] 
          : { size: 'OS', color: 'Default', sku: 'DEF-001', stock: 10 };

        // Calculate price based on your schema's virtual logic logic
        const realPrice = product.price - (product.price * (product.discountPercentage / 100));

        orderItems.push({
          name: product.title,
          qty: Math.floor(Math.random() * 3) + 1, // 1 to 3 qty
          image: product.thumbnail,
          price: parseFloat(realPrice.toFixed(2)),
          
          // Populate clothing specific fields from the chosen variant
          size: variant.size,
          color: variant.color,
          sku: variant.sku || faker.commerce.isbn(), 
          
          product: product._id
        });
      }

      // C. Calculate Financials
      const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
      const shippingPrice = itemsPrice > 100 ? 0 : 10; // Example: Free shipping over $100
      const taxPrice = itemsPrice * TAX_RATE;
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      // D. Determine Order Status & Dates
      // We weight the randomness so most orders are 'Delivered' or 'Processing'
      const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      const statusWeights = [0.1, 0.2, 0.2, 0.4, 0.1]; // Weighted probability
      const status = weightedRandom(statusOptions, statusWeights);

      const createdDate = faker.date.past({ years: 1 }); // Order placed sometime in last year
      
      let isPaid = false;
      let paidAt = undefined;
      let isDelivered = false;
      let deliveredAt = undefined;

      // Logic to ensure data consistency
      if (['Processing', 'Shipped', 'Delivered'].includes(status)) {
        isPaid = true;
        paidAt = new Date(createdDate.getTime() + 1000 * 60 * 60); // Paid 1 hour later
      }

      if (status === 'Delivered') {
        isDelivered = true;
        deliveredAt = new Date(createdDate.getTime() + 1000 * 60 * 60 * 24 * 3); // Delivered 3 days later
      }

      // E. Construct the Order Object
      const order = {
        user: randomUser._id,
        orderItems: orderItems,
        
        shippingAddress: {
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
          phoneNumber: faker.phone.number()
        },
        
        paymentMethod: 'Stripe',
        paymentResult: isPaid ? {
          id: faker.string.alphanumeric(10),
          status: 'COMPLETED',
          update_time: paidAt.toISOString(),
          email_address: randomUser.email
        } : {},

        itemsPrice: parseFloat(itemsPrice.toFixed(2)),
        taxPrice: parseFloat(taxPrice.toFixed(2)),
        shippingPrice: parseFloat(shippingPrice.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2)),

        isPaid,
        paidAt,
        isDelivered,
        deliveredAt,
        status,
        
        createdAt: createdDate, // Overwrite timestamp
      };

      ordersBuffer.push(order);
    }

    // 4. Bulk Insert
    await Order.insertMany(ordersBuffer);

    console.log(`✅ Successfully seeded ${ordersBuffer.length} orders.`);
    process.exit();

  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
};

// Helper for weighted random status
function weightedRandom(items, weights) {
    let i;
    for (i = 0; i < weights.length; i++)
        weights[i] += weights[i - 1] || 0;
    
    let random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return items[i];
}

seedOrders();