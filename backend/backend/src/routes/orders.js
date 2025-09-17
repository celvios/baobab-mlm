const express = require('express');
const auth = require('../middleware/auth');
const { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder,
  deleteAllOrders
} = require('../controllers/ordersController');

const router = express.Router();

// Create new order
router.post('/', auth, createOrder);

// Get user's orders
router.get('/', auth, getUserOrders);

// Get specific order
router.get('/:orderId', auth, getOrderById);

// Update order status
router.put('/:orderId', auth, updateOrderStatus);

// Delete all orders
router.delete('/', auth, deleteAllOrders);

// Delete order
router.delete('/:orderId', auth, deleteOrder);

module.exports = router;