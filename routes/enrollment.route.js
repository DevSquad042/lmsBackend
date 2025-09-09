import { Router } from 'express';
import {
  enrollUser,
  getAllEnrollments,
  getEnrollmentById,
  deleteEnrollment
} from '../controllers/enrollment.controller.js';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';

const router = Router();
router.use(verifyToken); // Protect all routes
router.post('/enroll', enrollUser);                // Enroll user to course
router.get('/', getAllEnrollments);          // Get all enrollments
router.get('/:id', getEnrollmentById);       // Get single enrollment by ID
router.delete('/:id', deleteEnrollment);     // Delete enrollment

export default router;
