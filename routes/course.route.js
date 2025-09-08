import express from 'express';
import { uploadWithUrl } from '../middlewares/uploads.middlewares.js';
import * as courseController from '../controllers/course.controller.js';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import { enrolledCourses } from '../controllers/enrolledCourses.controller.js';

const router = express.Router();

// ✅ Upload middlewares
const courseUpload = uploadWithUrl([{ name: 'thumbnail', maxCount: 1 }]);
const sectionUpload = uploadWithUrl([
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

// ✅ Create course with thumbnail
router.post('/', courseUpload, courseController.createCourse);

// ✅ Add a new section with video/pdf
router.post('/:courseId/sections', sectionUpload, courseController.addSection);

// ✅ Update section
router.put('/:courseId/sections/:index', sectionUpload, courseController.updateSection);

// ✅ Remove section
router.delete('/:courseId/sections/:index', courseController.removeSection);

// ✅ Course routes
router.get('/', courseController.getAllCourses);
router.get('/enrolled/:id', verifyToken, enrolledCourses);
router.get('/search', courseController.searchCourses);
router.get('/name/:title', courseController.getCourseByTitle);
router.get('/:id', courseController.getCourseById);

// ✅ Course preview route
router.get('/:id/preview', courseController.getCoursePreview);

// ✅ Update course (with optional thumbnail update)
router.put('/:id', courseUpload, courseController.updateCourse);

// ✅ Delete course
router.delete('/:id', courseController.deleteCourse);

export default router;