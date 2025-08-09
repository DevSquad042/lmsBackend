import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    course: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'Course', 
         required: true 
        },

    ratings: { 
        star: Number, 
        min: 1, 
        max: 5, 
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
        required: true 
    },

    totalratings: {
         type: String,
         default: 0,
    },

    comment: { 
        type: String, 
        required: true 
    },


}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);


