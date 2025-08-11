import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import Review from "../models/review.model.js"
import { createReview, getReviews, averageRating } from '../controllers/reviewcontroller.js';


const reviewRouter = express.Router();


// Create a review
reviewRouter.post('/rating', createReview)

// Get all reviews for a course
reviewRouter.get('/course/:courseId', getReviews)


// Get average rating for a course
reviewRouter.get('/course/:courseId/average', averageRating )
  
export default reviewRouter;

