import express from 'express';
import {
  createOrder,
  getOrderByID,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
  getUserOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Assuming you have auth middleware

const router = express.Router();

router.get('/', getAllOrders);
router.post('/', createOrder);
// router.get('/myorders', protect, getUserOrders);
// router.get('/:id', protect, getOrderByID);
// router.put('/:id/pay', protect, updateOrderToPaid);
// router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

export default router;
