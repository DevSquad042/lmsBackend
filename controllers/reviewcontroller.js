import mongoose from "mongoose";
import Review from "../models/review.model.js";


//CREATE REVIEW FOR A COURSE

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



// GET ALL REVIEWS FOR THE COURSE

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


//UPDATE REVIEW FUNTION

export const updateReview = async ( req, res) => {
  try {
    const {reviewId, userId} = req.body;

    console.log(reviewId, userId);
    
    

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID"
      });
    }

    // Validate input
    const { rating, comment } = req.body;
    if (!rating && !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rating or comment to update"
      });
    }

    // Find review & update only if it belongs to the logged-in user
    const updatedReview = await Review.findByIdAndUpdate(
  reviewId,
  { $set: { rating, comment } }, // Only update specific fields
  { new: true }
);

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to update it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      Review: updatedReview
    });
  } catch (error) {
    console.error("Error updating review:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error while updating review"
    });
  }
};

//DELETE REVIEW FUNCTION
export const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



//GET AVERAGE RATINGS

export const averageRating = async (req, res) => {
  try {
    // Validate courseId parameter
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Query reviews for the given courseId
    const reviews = await Review.find({courseId});

    // Handle case with no reviews
    if (!reviews || reviews.length === 0) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }

    // Calculate total rating and average
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = Number((totalRating / reviews.length).toFixed(1));

    // Return response with average rating and total reviews
    res.json({ averageRating, totalReviews: reviews.length });
  } catch (error) {
    // Log error for debugging
    console.error('Error calculating average rating:', error);
    res.status(500).json({ message: 'Server error while calculating average rating' });
  }
};