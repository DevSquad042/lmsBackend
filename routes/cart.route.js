import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cart.controller.js';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';

const cartRouter = express.Router();

cartRouter.use(verifyToken)
cartRouter.post('/add-to-cart', addToCart);
cartRouter.delete('/remove-from-cart', removeFromCart)
cartRouter.get('/get-cart', getCart)

export default cartRouter;