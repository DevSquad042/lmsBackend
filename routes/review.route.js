import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { createReview, getAllReviews, getAverageRating } from '../controllers/reviewcontroller.js';
// import { addRating } from '../controllers/rating.controller.js';


const reviewRouter = express.Router();


// Create a review
reviewRouter.post('/addReview/:id/:targetId', verifyToken, createReview)
reviewRouter.get('/getReviews/:targetId', getAllReviews)

reviewRouter.get('/average/:targetId', getAverageRating )
// reviewRouter.post('/addReview/:id/:courseId', verifyToken, createReview)

//update reviews
// reviewRouter.patch('/updateReview', updateReview)

//delete reviews
// reviewRouter.delete('/:id', deleteReview)

// Get all reviews for a course

// Get average rating for a course
// reviewRouter.post('/addRating/:Id/:instructorId/:courseId', verifyToken )


// reviewRouter.get('/:courseId', averageRating )

// reviewRouter.get('/:courseId', averageRating )





  
export default reviewRouter;

