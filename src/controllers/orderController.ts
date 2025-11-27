import type { Request, Response } from "express";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
    } = req.body;

    const orderItemsTyped = orderItems as Array<{
      name: string; // product slug for reference
      qty: number;
      image: string;
      price: number; // 0 or does not matter we recalculate it
      size: string;
      color: string;
      product: string;
    }>;

    // Recalculate prices to prevent manipulation from client side
    let itemsPrice = 0;
    let taxPrice = 0;
    let shippingPrice = 0;
    let totalPrice = 0;
    for (const item of orderItemsTyped) {
      const product = await Product.findOne({slug:item.product});
      if (product) {
        const itemTotal = product.price * item.qty;
        itemsPrice += itemTotal;
      } else {
        return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
      }
    }
    taxPrice = itemsPrice * 0.15; // Example: 15% tax
    shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
    totalPrice = itemsPrice + taxPrice + shippingPrice;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ success: false, message: "No order items" });
    } else {
      const order = new Order({
        orderItems: orderItems.map((item: any) => ({
          ...item,
          product: item._id, // Map _id to product for reference
          _id: undefined, // Remove _id from orderItem to let Mongoose generate a new one
        })),
        user: (req as any).user._id, // Assuming user ID is available from authentication middleware
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();
      res.status(201).json({ success: true, data: createdOrder });
    }
  } catch (error: any) {
    console.error(`Error in createOrder: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderByID = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("orderItems.product", "name image");

    if (order) {
      res.status(200).json({ success: true, data: order });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error: any) {
    console.error(`Error in getOrderByID: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.status(200).json({ success: true, data: updatedOrder });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error: any) {
    console.error(`Error in updateOrderToPaid: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.status = 'Delivered';
      order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
      order.courierName = req.body.courierName || order.courierName;

      const updatedOrder = await order.save();
      res.status(200).json({ success: true, data: updatedOrder });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error: any) {
    console.error(`Error in updateOrderToDelivered: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({}).populate("user", "firstName lastName email");
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    console.error(`Error in getAllOrders: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: (req as any).user._id });
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    console.error(`Error in getUserOrders: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
