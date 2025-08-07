import express from 'express';
import { protect } from '../middlewares/auth.middlewares.js';
import { placeOrder, getMyOrders } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/', protect, getMyOrders);

export default router;
