import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { createReview, getReviews, averageRating, updateReview, deleteReview } from '../controllers/reviewcontroller.js';


const reviewRouter = express.Router();


// Create a review
reviewRouter.post('/addReview',verifyToken, createReview)

//update reviews
reviewRouter.patch('/updateReview', verifyToken, updateReview)

//delete reviews
reviewRouter.delete('/:id', deleteReview)

// Get all reviews for a course
reviewRouter.get('/getReviews', getReviews)


// Get average rating for a course
reviewRouter.get('/averageRating', averageRating )
  
export default reviewRouter;

