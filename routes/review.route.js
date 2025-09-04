import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { createReview, getAllReviews, getAverageRating, userReviews } from '../controllers/reviewcontroller.js';



const reviewRouter = express.Router();


// Create a review
reviewRouter.post('/addReview/:id/:targetId', verifyToken, createReview)

//get Reviews
reviewRouter.get('/getReviews/:targetId', getAllReviews)

reviewRouter.get('/getReviews/userReviews/:id', userReviews)



//get average ratings
reviewRouter.get('/average/:targetId', getAverageRating )



export default reviewRouter;

