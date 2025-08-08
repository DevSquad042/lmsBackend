import express from 'express';
import upload from '../middleware/uploads.middlewares.js';
import * as courseController from '../controllers/course.controller.js';

const router = express.Router();

// POST: Create course (thumbnail + multiple section videos)
router.post(
  '/',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video-0' },
    { name: 'video-1' },
    { name: 'video-2' },
    { name: 'video-3' } // add more if needed
  ]),
  courseController.createCourse
);

// Section-specific endpoints
router.post(
  '/:courseId/sections',
  upload.single('video'),
  courseController.addSection
);

router.delete(
  '/:courseId/sections/:index',
  courseController.removeSection
);

router.put(
  '/:courseId/sections/:index',
  upload.single('video'),
  courseController.updateSection
);

// Other course endpoints
router.get('/', courseController.getAllCourses);
router.get('/name/:title', courseController.getCourseByName);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

export default router;
