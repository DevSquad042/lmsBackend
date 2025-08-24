import Cart from '../models/cart.model.js';
import Order from '../models/order.model.js';

export const placeOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('courses.course');
        if (!cart || cart.courses.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const totalAmount = cart.courses.reduce((acc, item) => acc + item.course.price, 0);

        // Simulate Payment Success
        const order = await Order.create({
            user: req.user.id,
            courses: cart.courses.map(c => ({ course: c.course._id })),
            totalAmount,
            paymentStatus: 'Paid'
        });

        // Clear Cart after Payment
        cart.courses = [];
        await cart.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('courses.course');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
