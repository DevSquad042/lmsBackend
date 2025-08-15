import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { placeOrder, getMyOrders } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/', verifyToken, placeOrder);
router.get('/', verifyToken, getMyOrders);

export default router;
