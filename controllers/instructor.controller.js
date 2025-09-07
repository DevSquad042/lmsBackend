import User from "../models/users.model.js";
import Profile from "../models/profile.model.js";
import Review from "../models/review.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

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

