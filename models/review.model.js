import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    courseId: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'Course', 
         required: false 
        },

    reviewCount: {
        type: Number, 
         required: false
        },

        

    targetType: {
    type: String,
    required: true,
    enum: ['instructor', 'Course', 'User']
  },

    rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
        required: true 
    },

    totalRatings: {
         type: Number,
         required: true
    },

    comment: { 
        type: String, 
        required: true 
    },


}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);

