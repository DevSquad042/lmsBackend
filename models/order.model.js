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
    paymentStatus: { type: String, enum: ['Pending','Paid', 'Failed'], default: 'Pending' },
    tx_ref: { type: String, unique: true } // <-- important
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

