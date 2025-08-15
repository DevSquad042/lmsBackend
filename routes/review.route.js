import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { createReview, getReviews, averageRating, updateReview } from '../controllers/reviewcontroller.js';
import rateLimit from 'express-rate-limit';


const reviewRouter = express.Router();


// Create a review
reviewRouter.post('/addReview',  verifyToken, createReview)
reviewRouter.post('/updateReview', updateReview)

// Get all reviews for a course
reviewRouter.get('/getReviews', getReviews)


// Get average rating for a course
reviewRouter.get('/averageRating', averageRating )
  
export default reviewRouter;

