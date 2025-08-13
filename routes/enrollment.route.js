import { Router } from 'express';
import {
  enrollUser,
  getAllEnrollments,
  getEnrollmentById,
  deleteEnrollment
} from '../controllers/enrollment.controller.js';

const router = Router();

router.post('/', enrollUser);                // Enroll user to course
router.get('/', getAllEnrollments);          // Get all enrollments
router.get('/:id', getEnrollmentById);       // Get single enrollment by ID
router.delete('/:id', deleteEnrollment);     // Delete enrollment

export default router;
