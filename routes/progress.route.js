import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { saveProgress, getCourseProgress, getVideoProgress } from '../controllers/progress.controller.js';

const progressRouter = express.Router();

// All routes require authentication
progressRouter.use(verifyToken);

// Save video progress
progressRouter.post('/save', saveProgress);

// Get progress for entire course
progressRouter.get('/course/:courseId', getCourseProgress);

// Get progress for specific video
progressRouter.get('/video/:courseId/:sectionId/:videoId', getVideoProgress);

export default progressRouter;