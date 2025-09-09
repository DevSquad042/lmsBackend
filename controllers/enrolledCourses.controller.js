import Enrollment from '../models/enrollment.model.js';
import mongoose from 'mongoose';

export const enrolledCourses = async (req, res) => {
    try {
        console.log('enrolledCourses called with params:', req.params);
        console.log('User from token:', req.user);

        if (!req.user || !req.user.id) {
            console.log('No user in request');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user.id;
        console.log('User ID from token:', userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid user ID:', userId);
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const enrollments = await Enrollment.find({ user: userId }).populate('course');
        console.log('Enrollments found:', enrollments.length);
        console.log('Sample enrollment:', enrollments[0] ? {
            _id: enrollments[0]._id,
            user: enrollments[0].user,
            course: enrollments[0].course
        } : 'No enrollments');

        const courses = enrollments
            .map(enrollment => enrollment.course)
            .filter(course => course !== null); // Filter out null courses

        console.log('Courses extracted:', courses.length);
        console.log('Sample course:', courses[0] ? {
            _id: courses[0]._id,
            title: courses[0].title
        } : 'No courses');

        res.status(200).json({ courses });
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        res.status(500).json({ message: "Failed to fetch enrolled courses", error: error.message });
    }
}

