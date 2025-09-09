import Enrollment from '../models/enrollment.model.js';
import User from '../models/users.model.js';
import Course from '../models/course.model.js';


//  * @desc Enroll a user in a course
//  * @route POST /api/enrollments

export const enrollUser = async (req, res) => {
  try {
    const { userId, courseId, paymentreference, amount } = req.body;

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

    const enrollment = new Enrollment({ user: userId, course: courseId, paymentreference, amount });
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
    const userId = req.params.id || req.user.id; // Use param if provided, else authenticated user
    console.log('User ID:', userId);

    // Find enrollments for this user and populate course details
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title description instructor rating thumbnail price')
      .sort({ enrolledAt: -1 });

    console.log('Enrollments found:', enrollments);

    // Extract course data from enrollments
    const courses = enrollments
      .filter(enrollment => enrollment.course) // Filter out enrollments with missing courses
      .map(enrollment => ({
        _id: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        instructor: enrollment.course.instructor,
        rating: enrollment.course.rating,
        thumbnail: enrollment.course.thumbnail,
        price: enrollment.course.price,
        enrolledAt: enrollment.enrolledAt,
        progress: 0 // Since progress is not in the model
      }));
    
    res.json({
      status: 'success',
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ 
      message: 'Error fetching courses', 
      error: error.message 
    });
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
