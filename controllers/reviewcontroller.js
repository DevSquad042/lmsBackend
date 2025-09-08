import mongoose from "mongoose";
import Review from "../models/review.model.js";
import User from "../models/users.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";




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
      // Check if user is enrolled in the course
      const enrollment = await Enrollment.findOne({ user: userId, course: targetId });
      if (!enrollment) {
        return res.status(403).json({ message: "You must be enrolled in this course to leave a review." });
      }
    }
    else if (type === "instructor") {
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
    const reviewCount = await Review.countDocuments({ userId, targetId, targetType });

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

    // Update totalRatings to reflect the current count after saving
    const updatedTotalRatings = await Review.countDocuments({ targetId, targetType });
    review.totalRatings = updatedTotalRatings;

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

    console.log('getAllReviews called with targetId:', targetId, 'type:', type);

    // Validate type (case insensitive)
    const validTypes = ['course', 'instructor', 'user'];
    if (!type || !validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Query parameter 'type' must be 'course', 'instructor', or 'user'" });
    }

    // Normalize type to match database values
    const normalizedType = type.toLowerCase() === 'course' ? 'Course' : type.toLowerCase();

    // Validate targetId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: 'Invalid targetId' });
    }

    // Verify target exists
    if (normalizedType === 'Course') {
      console.log('Checking course with id:', targetId);
      const course = await Course.findById(targetId);
      if (!course) {
        console.log('Course not found');
        return res.status(404).json({ error: 'Course not found' });
      }
    } else {
      console.log('Checking user with id:', targetId);
      const user = await User.findById(targetId);
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ error: 'User not found' });
      }
    }

    // Fetch all reviews for the target
    let query;
    if (normalizedType === 'Course') {
      query = { targetId, targetType: normalizedType };
    } else {
      // For users/instructors, get reviews given by the user
      query = { userId: targetId };
    }
    const reviews = await Review.find(query)
    .populate('userId', 'userName email') // Populate reviewer details
    .select('rating comment createdAt')
    .sort({ createdAt: -1 }) // Select relevant fields

    console.log('Found reviews:', reviews.length);

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
    console.log('userReviews called with id:', req.params.id);

    const reviews = await Review.find({ userId: req.params.id })
      .populate('courseId', 'title') // Populate course title
      .sort({ createdAt: -1 });

    console.log('Found reviews count:', reviews.length);
    console.log('Sample review:', reviews[0] ? {
      _id: reviews[0]._id,
      userId: reviews[0].userId,
      targetType: reviews[0].targetType,
      courseId: reviews[0].courseId,
      rating: reviews[0].rating
    } : 'No reviews found');

    const mappedReviews = reviews.map(review => {
      console.log('Mapping review:', review._id, 'courseId:', review.courseId);
      return {
        _id: review._id,
        userId: review.userId,
        courseId: review.courseId ? review.courseId._id : null,
        courseTitle: review.courseId ? review.courseId.title : null, // Include course title
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      };
    });

    console.log('Mapped reviews successfully');

    res.json({
      status: 'success',
      count: reviews.length,
      data: {
        reviews: mappedReviews
      }
    });
  } catch (error) {
    console.error('Error in userReviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};



//GET AVERAGE|| Get average rating for a specific course or instructor

export const getAverageRating = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { type } = req.query;
    console.log('getAverageRating called with targetId:', targetId, 'type:', type);

    // Validate type (case insensitive)
    const validTypes = ['course', 'instructor', 'user'];
    if (!type || !validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Query parameter 'type' must be 'course', 'instructor', or 'user'" });
    }

    // Normalize type to match database values
    const normalizedType = type.toLowerCase() === 'course' ? 'Course' : type.toLowerCase();

    // Validate targetId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      console.log('Invalid targetId:', targetId);
      return res.status(400).json({ error: 'Invalid targetId' });
    }

    // Verify target exists
    if (normalizedType === 'Course') {
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
    if (normalizedType === 'Course') {
      matchQuery = { targetId, targetType: normalizedType };
    } else {
      // For users, get reviews given by the user
      matchQuery = { userId: targetId };
    }
    console.log('Match query:', matchQuery);
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
    console.log('Aggregation result:', result);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalReviews = result.length > 0 ? result[0].totalReviews : 0;
    const totalRatingSum = result.length > 0 ? result[0].totalRatingSum : 0;

    res.status(200).json({
      status: 'success',
      data: {
        targetId,
        targetType: normalizedType,
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

// Separate function for course average ratings
export const getCourseAverageRating = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('getCourseAverageRating called with courseId:', courseId);

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log('Invalid courseId:', courseId);
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Calculate average rating and total reviews for the course
    const matchQuery = { targetId: new mongoose.Types.ObjectId(courseId), targetType: 'Course' };
    console.log('Match query:', matchQuery);

    // Debug: Check how many documents match
    const documentCount = await Review.countDocuments(matchQuery);
    console.log('Documents matching query:', documentCount);

    const result = await Review.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          totalRatingSum: { $sum: '$rating' },
        },
      },
    ]);
    console.log('Aggregation result:', result);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalReviews = result.length > 0 ? result[0].totalReviews : 0;
    const totalRatingSum = result.length > 0 ? result[0].totalRatingSum : 0;

    res.status(200).json({
      status: 'success',
      data: {
        courseId,
        averageRating: averageRating ? Number(averageRating.toFixed(2)) : 0,
        totalReviews,
        totalRatingSum,
      },
    });
  } catch (error) {
    console.error('Error in getCourseAverageRating:', error);
    res.status(500).json({ error: 'Server error while calculating course average rating', details: error.message });
  }
};

// Fetch all reviews for a course with deconstructed fields
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('getCourseReviews called with courseId:', courseId);

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Fetch all reviews for the course
    const reviews = await Review.find({ targetId: courseId, targetType: 'Course' })
      .populate('userId', 'userName email')
      .select('rating comment createdAt')
      .sort({ createdAt: -1 });

    // Deconstruct and structure the reviews
    const structuredReviews = reviews.map(review => {
      const createdAt = new Date(review.createdAt);
      return {
        id: review._id,
        userName: review.userId ? review.userId.userName : 'Anonymous',
        userEmail: review.userId ? review.userId.email : '',
        rating: review.rating,
        comment: review.comment || '',
        date: createdAt.toISOString().split('T')[0], // YYYY-MM-DD
        time: createdAt.toTimeString().split(' ')[0], // HH:MM:SS
        fullDateTime: createdAt.toISOString()
      };
    });

    res.set('Cache-Control', 'no-cache');
    res.status(200).json({
      status: 'success',
      count: structuredReviews.length,
      data: {
        courseId,
        reviews: structuredReviews
      }
    });
  } catch (error) {
    console.error('Error in getCourseReviews:', error);
    res.status(500).json({ error: 'Server error while fetching course reviews', details: error.message });
  }
};