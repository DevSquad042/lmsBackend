import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { createReview, getAllReviews, getAverageRating, getCourseAverageRating, userReviews } from '../controllers/reviewcontroller.js';



const reviewRouter = express.Router();


// Create a review
reviewRouter.post('/addReview/:id/:targetId', verifyToken, createReview)

//get Reviews
reviewRouter.get('/getReviews/:targetId', getAllReviews)

reviewRouter.get('/getReviews/userReviews/:id', userReviews)



//get average ratings
reviewRouter.get('/average/:targetId', getAverageRating )

//get course average ratings separately
reviewRouter.get('/courseAverage/:courseId', getCourseAverageRating)



export default reviewRouter;

