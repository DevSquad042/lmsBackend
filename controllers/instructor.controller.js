import User from "../models/users.model.js";
import Profile from "../models/profile.model.js";
import Review from "../models/review.model.js";

export const getAllInstructors = async (req, res) => {
  try {
    // Get all instructors
    const instructors = await User.find({ role: "instructor" })
      .select("firstName lastName email role")
      .lean();

    // Enrich with profile + ratings
    const enriched = await Promise.all(
      instructors.map(async (inst) => {
        // Populate profile
        const profile = await Profile.findOne({ userId: inst._id }).lean();

        // Get reviews where targetType = instructor
        const reviews = await Review.find({
          targetType: "instructor",
          courseId: { $exists: false }, // ensures it's not course-specific
          userId: inst._id,
        }).lean();

        // Calculate average rating
        let avgRating = 0;
        if (reviews.length > 0) {
          const total = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          avgRating = total / reviews.length;
        }

        return {
          ...inst,
          profile,
          avgRating: Number(avgRating.toFixed(1)),
          totalReviews: reviews.length,
          reviews, // optional: include full review objects
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Server error" });
  }
};
