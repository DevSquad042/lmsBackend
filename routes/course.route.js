import express from 'express';
import upload from '../middlewares/uploads.middlewares.js';
import * as courseController from '../controllers/course.controller.js';

const router = express.Router();

// Create course with thumbnail, videos, PDFs
router.post('/', upload, courseController.createCourse);

// Section routes
router.post('/:courseId/sections', upload, courseController.addSection);
router.delete('/:courseId/sections/:index', courseController.removeSection);
router.put('/:courseId/sections/:index', upload, courseController.updateSection);

// Course routes
router.get('/', courseController.getAllCourses);
router.get('/name/:title', courseController.getCourseByTitle);
router.get('/:id', courseController.getCourseById);
router.put('/:id', upload, courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

export default router;
