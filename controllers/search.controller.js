import Course from "../models/course.model.js";

// Search courses by title, description, or tags
export const searchCourses = async (req, res) => {
  try {
    const { query } = req.query; // search string ?query=javascript

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const results = await Course.find({
      $or: [
        { title: { $regex: query, $options: "i" } },       // case-insensitive match
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } }         // if you store tags as array
      ]
    }).select("title description price thumbnail"); // return only needed fields

    if (results.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error performing search", error: error.message });
  }
};
