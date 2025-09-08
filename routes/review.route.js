import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { createReview, getAllReviews, getAverageRating, getCourseAverageRating } from '../controllers/reviewcontroller.js';



const reviewRouter = express.Router();


// Create a review
reviewRouter.post('/addReview/:id/:targetId', verifyToken, createReview)

//get Reviews
reviewRouter.get('/getReviews/:targetId', getAllReviews)


//get average ratings
reviewRouter.get('/average/:targetId', getAverageRating )

reviewRouter.get('/courseAverage/:courseId', getCourseAverageRating)



export default reviewRouter;

