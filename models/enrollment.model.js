import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    paymentreference: { type: String, unique: true ,required: true },
    amount: Number,
}, { timestamps: true });

export default mongoose.model('Enrollment', enrollmentSchema);
