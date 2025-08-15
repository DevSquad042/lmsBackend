 import mongoose from "mongoose";
import Course from "../models/course.model.js";
import Review from "../models/review.model.js";
import express from "express";


// export const rating = expressAsyncHandlerx( async(req, res) => {
//     const {_id} = req.user;
//     try {
//         const { star, prodId} = req.body;
//         const product = await product.findById(prodId);
        
//         let alreadyreviewed = product.ratings.find(
//             (userId) => userId.postedby.toString() === _id.toString()
//         );
//         if (alreadyreviewed) {
          

//             const updatedReview = await product.updateOne(
//                 {
//                 rating: { $eleMatch: alreadyreviewed},
//             },
//             {
//                 new: true,
//             },
//             {
//                 $set :{"ratings.$.star": star}
//             },

//             );
//             res.json(updatedReview);
            


//         } else {
//             const reviewProduct = await product.findByIdAndUpdate(
//                 prodId,
//                 {
//                     $push: {
//                         rating: {
//                             star: star,
//                             postedby: _id,
//                         },
//                     },
//             },
//         {
//             new: true,
//         });
//         res.json(reviewProduct);
//         }
        
//     } catch (error) {
//         res.status(400)
//     }

// });

/////////////////////////////////////


  export const createReview = async (req, res) => {
  try {
    const { courseId, userId, rating, comment } = req.body;

    // Validate input
    if (!courseId || !userId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Count how many reviews user already has for this course
    const reviewCount = await Review.countDocuments({ userId, courseId });

    if (reviewCount >= 5) {
      return res.status(400).json({
        message: "You have already reviewed this course twice."
      });
    }

    const review = new Review({ courseId, userId, rating, comment });
    await review.save();
    res.status(201).json({
      status: 'success',
      data: {
        review: review
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for a course

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('userId', 'courseId')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { reviewId } = req.params;
    const userId = req.user._id;
    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewIdrs},
      { rating, comment, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found or not yours" });
    }

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get average rating for a course
export const averageRating = async (req, res) => {
  try {
    const reviewsAvg = await Review.find({ course: req.params.courseId });
    if (reviewsAvg.length === 0) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }
    const totalRating = reviewsAvg.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviewsAvg.length).toFixed(1);
    res.json({ averageRating, totalReviews: reviewsAvg.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


