import User from "../models/users.model.js";
import Profile from "../models/profile.model.js";
import Review from "../models/review.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

export const getAllInstructors = async (req, res) => {
  try {
    // 1. Find all instructors
    const instructors = await User.find({ role: "instructor" })
      .populate("profile") // attach profile info
      .lean(); // convert to plain JS objects

    // 2. For each instructor, get reviews, ratings, and student count
    const enriched = await Promise.all(
      instructors.map(async (inst) => {
        // Reviews targeted at this instructor
        const reviews = await Review.find({ targetType: "instructor", userId: inst._id }).lean();
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        // Courses created by this instructor
        const courses = await Course.find({ instructor: inst._id }).select("_id").lean();

        // Count enrollments across all their courses
        const courseIds = courses.map((c) => c._id);
        const studentCount = await Enrollment.countDocuments({ course: { $in: courseIds } });

        return {
          ...inst,
          profile: inst.profile || {},
          avgRating,
          totalReviews: reviews.length,
          reviews,
          studentCount, //  number of students this instructor has
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Server error" });
  }
};
