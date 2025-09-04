import mongoose from "mongoose";
import Review from "../models/review.model.js";
import User from "../models/users.model.js";
import Course from "../models/course.model.js";




//CREATE OR ADD REVIEWS AND RATINGS TO INSTRUCTOR OR COURSE

export const createReview = async (req, res) => {
  try {
    const {targetId } = req.params; // :id is userId, :targetId is courseId or instructorId
    const { type } = req.query; // Get type from query (e.g., ?type=course or ?type=instructor)
    const { rating, comment } = req.body;
    const userId = req.user.id; // From authentication middleware

    // console.log("Request params:", { id, targetId, type, userId, rating, comment });

    // Validate type
    if (!type || !["Course", "instructor", "user"].includes(type)) {
      return res.status(400).json({ message: "Query parameter 'type' must be 'course', 'instructor', or 'user'" });
    }

    // Validate required fields
    if (!userId || !rating || !targetId) {
      return res.status(400).json({ message: "userId, rating, and targetId are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: "Invalid targetId" });
    }

    // Determine target type and verify target exists
    let targetType, courseId;
    if (type === "Course") {
      console.log("Checking courseId:", targetId);
      targetType = "Course";
      courseId = targetId; // Set courseId for course reviews
      const course = await Course.findById(targetId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
    } else if (type === "instructor") {
      console.log("Checking instructorId:", targetId);
      targetType = "instructor";
      const user = await User.findById(targetId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
    } else if (type === "user") {
      console.log("Checking userId:", targetId);
      targetType = "user";
      const user = await User.findById(targetId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
    }
     const existingReviews = await Review.find({ targetId, targetType });
    console.log('Existing reviews:', existingReviews);

    // Count how many reviews the user already has for this target

    const reviewCount = await Review.countDocuments({ targetId, targetType });

    if (reviewCount >= 5) {
      return res.status(400).json({
        message: "You have already reviewed this target 5 times."
      });
    }

  // Count total reviews for this target (for response)
    const totalRatings = await Review.countDocuments({ targetId, targetType });
    // console.log('Total reviews for target:', totalRatings);----- This is to debug



    // Create the review
    const reviewData = {
      userId,
      targetId,
      targetType,
      totalRatings,
      rating,
      reviewCount,
      comment: comment || "", // Optional comment with default empty string
    };
    if (type === "Course") {
      reviewData.courseId = courseId; // Only include courseId for course reviews
    }

    const review = new Review(reviewData);

    await review.save();
    res.status(201).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (error) {
    console.error("Error in createReview:", error);
    res.status(500).json({ error: "Server error while adding review", details: error.message });
  }
};


// GET REVIEWS AND RATINGS Get all reviews for a specific course or instructor

export const getAllReviews = async (req, res) => {
  try {
    const { targetId } = req.params; // targetId is courseId or instructorId
    const { type } = req.query; // ?type=course or ?type=instructor

  //  // Validate type
  //   if (!type || !['Course', 'instructor', 'user'].includes(type)) {
  //     return res.status(400).json({ message: "Query parameter 'type' must be 'course', 'instructor', or 'user'" });
  //   }

    // Validate targetId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: 'Invalid targetId' });
    }

    // Verify target exists
    if (type === 'Course') {
      const course = await Course.findById(targetId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
    } else {
      const user = await User.findById(targetId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    // Fetch all reviews for the target
    let query;
    if (type === 'Course') {
      query = { targetId, targetType: type };
    } else {
      // For users, get reviews given by the user
      query = { userId: targetId };
    }
    const reviews = await Review.find(query)
    .populate('userId', 'userName email') // Populate reviewer details
    .select('rating comment createdAt')
    .sort({ createdAt: -1 }) // Select relevant fields

    console.log(reviews)
    

    res.status(200).json({
      status: 'success',
      count: reviews.length,
      data: {
        reviews
      },
    });
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    res.status(500).json({ error: 'Server error while fetching reviews', details: error.message });
  }
};

export const userReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.id })
      .populate('courseId', 'title') // Populate course title
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      count: reviews.length,
      data: {
        reviews: reviews.map(review => ({
          _id: review._id,
          userId: review.userId,
          courseId: review.courseId._id,
          courseTitle: review.courseId.title, // Include course title
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};



//GET AVERAGE|| Get average rating for a specific course or instructor

export const getAverageRating = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { type } = req.query;

    // Validate type
    if (!type || !['Course', 'instructor', 'user'].includes(type)) {
      return res.status(400).json({ message: "Query parameter 'type' must be 'course', 'instructor', or 'user'" });
    }

    // Validate targetId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: 'Invalid targetId' });
    }

    // Verify target exists
    if (type === 'Course') {
      const course = await Course.findById(targetId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
    } else {
      const user = await User.findById(targetId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    // Calculate average rating and total reviews
    let matchQuery;
    if (type === 'Course') {
      matchQuery = { targetId, targetType: type };
    } else {
      // For users, get reviews given by the user
      matchQuery = { userId: targetId };
    }
    const result = await Review.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          totalRatingSum: { $sum: '$rating' }, // Sum of all ratings
        },
      },
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalReviews = result.length > 0 ? result[0].totalReviews : 0;
    const totalRatingSum = result.length > 0 ? result[0].totalRatingSum : 0;

    res.status(200).json({
      status: 'success',
      data: {
        targetId,
        targetType: type,
        averageRating: averageRating ? Number(averageRating.toFixed(2)) : 0,
        totalReviews,
        totalRatingSum, // Sum of ratings
      },
    });
  } catch (error) {
    console.error('Error in getAverageRating:', error);
    res.status(500).json({ error: 'Server error while calculating average rating', details: error.message });
  }
};