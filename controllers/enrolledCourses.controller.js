import Enrollment from '../models/enrollment.model.js';

export const enrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id

        const enrollments = await Enrollment.find({ user: userId }).populate('course');
        console.log(enrollments)
        const courses = enrollments.map(enrollment => enrollment.course);
        res.status(200).json({ courses });
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        res.status(500).json({ message: "Failed to fetch enrolled courses" });
    }
}

