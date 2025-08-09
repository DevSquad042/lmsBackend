import express from 'express';
import upload from '../middlewares/uploads.middlewares.js';
import * as courseController from '../controllers/course.controller.js';

const router = express.Router(); 

// Create course with thumbnail and videos
router.post(
  '/',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video-0' },
    { name: 'video-1' },
    { name: 'video-2' },
    { name: 'video-3' }
  ]),
  courseController.createCourse
);

// Section routes
router.post('/:courseId/sections', upload.single('video'), courseController.addSection);
router.delete('/:courseId/sections/:index', courseController.removeSection);
router.put('/:courseId/sections/:index', upload.single('video'), courseController.updateSection);

// Course routes
router.get('/', courseController.getAllCourses);
router.get('/name/:title', courseController.getCourseByTitle);
router.get('/:id', courseController.getCourseById);
router.put('/:id', upload.single('thumbnail'), courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

export default router;
