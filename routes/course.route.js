import express from 'express';
import upload from '../middlewares/uploads.middlewares.js';
import * as courseController from '../controllers/course.controller.js';

const router = express.Router();

// ✅ Create course with thumbnail, videos, PDFs
router.post(
  '/',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video-0', maxCount: 1 },
    { name: 'video-1', maxCount: 1 }, // add more if needed
    { name: 'pdf-0', maxCount: 1 },
    { name: 'pdf-1', maxCount: 1 },   // add more if needed
  ]),
  courseController.createCourse
);

// ✅ Section routes
router.post(
  '/:courseId/sections',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  courseController.addSection
);

router.put(
  '/:courseId/sections/:index',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  courseController.updateSection
);

router.delete('/:courseId/sections/:index', courseController.removeSection);

// ✅ Course routes
router.get('/', courseController.getAllCourses);
router.get('/name/:title', courseController.getCourseByTitle);
router.get('/:id', courseController.getCourseById);

router.put(
  '/:id',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
  ]),
  courseController.updateCourse
);

router.delete('/:id', courseController.deleteCourse);

export default router;
