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
         required: true 
        },

    rating: { 
        type: Number, 
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


// const mongoose = require('mongoose');

// const reviewsSchema = new mongoose.Schema({
//   courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   rating: { type: Number, required: true, min: 1, max: 5 },
//   comment: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Review', reviewsSchema);


