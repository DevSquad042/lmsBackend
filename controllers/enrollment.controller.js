import Enrollment from '../models/enrollment.model.js';
import User from '../models/users.model.js';
import Course from '../models/course.model.js';


//  * @desc Enroll a user in a course
//  * @route POST /api/enrollments

export const enrollUser = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Ensure both exist
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (!user || !course) {
      return res.status(404).json({ message: 'User or course not found' });
    }

    // Prevent duplicate enrollment
    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    if (existing) {
      return res.status(400).json({ message: 'User already enrolled in this course' });
    }

    const enrollment = new Enrollment({ user: userId, course: courseId });
    await enrollment.save();

    res.status(201).json({ message: 'User enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling user', error: error.message });
  }
};

/**
 * @desc Get all enrollments
 * @route GET /api/enrollments
 */
export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user', 'name email')
      .populate('course', 'title description');
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
  }
};

/**
 * @desc Get a single enrollment by ID
 * @route GET /api/enrollments/:id
 */
export const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('course', 'title description');
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollment', error: error.message });
  }
};

/**
 * @desc Delete an enrollment
 * @route DELETE /api/enrollments/:id
 */
export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    res.status(200).json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting enrollment', error: error.message });
  }
};
