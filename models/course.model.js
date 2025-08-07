import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String }, 
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    sections: [
        {
            title: { type: String },
            videoUrl: { type: String } 
        }
    ]
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
