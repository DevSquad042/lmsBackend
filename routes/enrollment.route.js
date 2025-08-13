import { Router } from 'express';
import {
  enrollUser,
  getAllEnrollments,
  getEnrollmentById,
  deleteEnrollment
} from '../controllers/enrollment.controller.js';

const enrollmentRoutes = Router();

router.post('/enroll', enrollUser);                // Enroll user to course
router.get('/', getAllEnrollments);          // Get all enrollments
router.get('/:id', getEnrollmentById);       // Get single enrollment by ID
router.delete('/:id', deleteEnrollment);     // Delete enrollment

export default enrollmentRoutes;
