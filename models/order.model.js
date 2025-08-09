import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courses: [
        {
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            purchasedAt: { type: Date, default: Date.now }
        }
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Failed'], default: 'Paid' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
