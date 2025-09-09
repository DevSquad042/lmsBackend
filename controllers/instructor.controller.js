import mongoose from "mongoose";
import User from "../models/users.model.js"
import Course from "../models/course.model.js"

 export const getAllInstructors = async (req, res) => {
  try {
    //  Find all instructors
    const instructors = await User.find({ role: "instructor" }).lean();

    //  Enrich each instructor
    const enriched = await Promise.all(
      instructors.map(async (inst) => {
        // Find profile linked by userId
        const profile = await Profile.findOne({ userId: inst._id }).lean();

        // Reviews for this instructor
        const reviews = await Review.find({ targetType: "instructor", userId: inst._id }).lean();
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        // Courses created by this instructor
        const courses = await Course.find({ instructor: inst._id }).select("_id").lean();

        // Count enrollments
        const courseIds = courses.map((c) => c._id);
        const studentCount = await Enrollment.countDocuments({ course: { $in: courseIds } });

        return {
          ...inst,
          profile: profile || {},   // now real profile comes here
          avgRating,
          totalReviews: reviews.length,
          reviews,
          studentCount,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Server error" });
  }
};
  

export const getCoursesByInstructorId = async (req, res) => {
    const { id } = req.params;
    console.log("Instructor ID received:", id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid instructor ID' });
    }
    try {
        const instructor = await User.findById(id);
        if (!instructor || instructor.role !== 'instructor') {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        const courses = await Course.find({ instructor: id });
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getInstructorById = async (req, res) => {
    const { id } = req.params;
    console.log("getInstructorById called with ID:", id);
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("Invalid instructor ID");
        return res.status(400).json({ message: 'Invalid instructor ID' });
    }
    try {
        const instructor = await User.findById(id);
        console.log("Instructor found:", !!instructor);
        if (!instructor || instructor.role !== 'instructor') {
            console.log("Instructor not found or not instructor role");
            return res.status(404).json({ message: 'Instructor not found' });
        }
        const courses = await Course.find({ instructor: id });
        console.log("Courses found:", courses.length);
        console.log("Sending 200 response");
        res.status(200).json({ instructor, courses });
    } catch (error) {
        console.error("Error fetching instructor:", error);
        res.status(500).json({ message: "Server error" });
    }
}


