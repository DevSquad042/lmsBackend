// controllers/course.controller.js
import Course from "../models/course.model.js";

// ---------- Helpers ----------

// validate youtube link
function isValidYouTubeUrl(url) {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i;
  return typeof url === "string" && regex.test(url);
}

// calculate discounted price
function applyDiscount(course) {
  const now = new Date();

  if (
    course.discountPercentage > 0 &&
    (!course.discountExpiry || new Date(course.discountExpiry) > now)
  ) {
    const discountAmount = (course.price * course.discountPercentage) / 100;
    course.discountedPrice = Math.max(course.price - discountAmount, 0);
  } else {
    course.discountedPrice = course.price;
  }

  return course;
}

// build base URL (http://host:port)
function getBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

// turn filename -> full URL at /uploads/<filename>
function toFileUrl(req, filename) {
  if (!filename) return "";
  return `${getBaseUrl(req)}/uploads/${filename}`;
}

// parse categories/tags from string ("a,b") or JSON string or array
function toArray(val) {
  if (Array.isArray(val)) return val;
  if (val == null) return [];
  if (typeof val === "string") {
    // Try JSON first
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      // fall through to comma-separated
    }
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// parse sections from JSON string or array
function parseSections(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// ---------- CRUD OPERATIONS ----------

// ✅ Create course
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      price,
      categories,
      tags,
      sections,
      discountPercentage,
      discountExpiry,
    } = req.body;

    if (!title || !description || !instructor) {
      return res
        .status(400)
        .json({ message: "Title, description, and instructor are required" });
    }

    const exists = await Course.findOne({
      title: new RegExp("^" + title + "$", "i"),
    });
    if (exists)
      return res.status(409).json({ message: "Course title already exists" });

    // Thumbnail (full URL)
    const thumbnailFilename = req.files?.thumbnail?.[0]?.filename || "";
    const thumbnail = thumbnailFilename ? toFileUrl(req, thumbnailFilename) : "";

    // Sections (support multi-part uploads: video-0, pdf-0, etc)
    const incomingSections = parseSections(sections);
    const parsedSections = incomingSections.map((section, index) => {
      const maybeVideoUrl =
        section.videoUrl && isValidYouTubeUrl(section.videoUrl)
          ? section.videoUrl
          : "";

      const videoFileName = req.files?.[`video-${index}`]?.[0]?.filename || "";
      const pdfFileName = req.files?.[`pdf-${index}`]?.[0]?.filename || "";

      return {
        title: section.title,
        videoUrl: maybeVideoUrl,
        videoFile: videoFileName ? toFileUrl(req, videoFileName) : "",
        pdf: pdfFileName ? toFileUrl(req, pdfFileName) : "",
        isPreview: !!section.isPreview,
      };
    });

    const newCourse = new Course({
      title,
      description,
      instructor,
      price: Number(price) || 0,
      discountPercentage: Number(discountPercentage) || 0,
      discountExpiry: discountExpiry || null,
      categories: toArray(categories),
      tags: toArray(tags),
      thumbnail,
      sections: parsedSections,
    });

    const saved = await newCourse.save();
    res
      .status(201)
      .json({ message: "Course created", course: applyDiscount(saved.toObject()) });
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all courses
export const getAllCourses = async (req, res) => {
  try {
    let courses = await Course.find().sort({ createdAt: -1 });
    courses = courses.map((c) => applyDiscount(c.toObject()));
    res.status(200).json(courses);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve courses", error: err.message });
  }
};

// ✅ Get course by ID (FULL)
export const getCourseById = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course = applyDiscount(course.toObject());
    res.status(200).json(course);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve course", error: err.message });
  }
};

// ✅ Get course preview
export const getCoursePreview = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course = applyDiscount(course.toObject());

    // Only return preview sections
    const previewSections = course.sections.filter((s) => s.isPreview);

    const previewData = {
      _id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      thumbnail: course.thumbnail,
      price: course.price,
      discountedPrice: course.discountedPrice,
      categories: course.categories,
      tags: course.tags,
      sections: previewSections,
    };

    res.status(200).json(previewData);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch preview", error: err.message });
  }
};

// ✅ Get course by title
export const getCourseByTitle = async (req, res) => {
  try {
    const title = req.params.title;
    let course = await Course.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    course = applyDiscount(course.toObject());
    res.status(200).json(course);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching course by title", error: err.message });
  }
};

// Search courses
export const searchCourses = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(400).json({
        message: 'Search query is required',
        error: 'Missing or invalid search parameter'
      });
    }

    const searchQuery = q.trim();

    // Search in multiple fields using regex (case-insensitive)
    const courses = await Course.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { instructor: { $regex: searchQuery, $options: 'i' } },
        { categories: { $in: [new RegExp(searchQuery, 'i')] } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ]
    })
    .limit(50) // Limit results for performance
    .sort({ createdAt: -1 }); // Sort by newest first

    // Apply discount to each course
    const coursesWithDiscount = courses.map(course => applyDiscount(course.toObject()));

    console.log(`Search for "${searchQuery}" returned ${coursesWithDiscount.length} results`);

    res.json({
      status: 'success',
      count: coursesWithDiscount.length,
      data: coursesWithDiscount
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      message: 'Failed to retrieve courses',
      error: error.message
    });
  }
};

// ✅ Update course (thumbnail -> full URL if provided)
export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = { ...req.body };

    // Normalize categories / tags if provided
    if (updates.categories !== undefined) updates.categories = toArray(updates.categories);
    if (updates.tags !== undefined) updates.tags = toArray(updates.tags);

    // Normalize numeric fields if provided
    if (updates.price !== undefined) updates.price = Number(updates.price) || 0;
    if (updates.discountPercentage !== undefined)
      updates.discountPercentage = Number(updates.discountPercentage) || 0;

    // Thumbnail (full URL)
    if (req.files?.thumbnail?.[0]) {
      updates.thumbnail = toFileUrl(req, req.files.thumbnail[0].filename);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(applyDiscount(updatedCourse.toObject()));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update course", error: err.message });
  }
};

// ✅ Delete course
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const deleted = await Course.findByIdAndDelete(courseId);
    if (!deleted) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete course", error: err.message });
  }
};

// ---------------- SECTIONS ----------------

// ✅ Add section (saves video/pdf as full URLs)
export const addSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, videoUrl, isPreview } = req.body;

    if (!title) return res.status(400).json({ message: "Section title required" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const sectionData = {
      title,
      videoUrl: isValidYouTubeUrl(videoUrl) ? videoUrl : "",
      videoFile: req.files?.video?.[0]?.filename
        ? toFileUrl(req, req.files.video[0].filename)
        : "",
      pdf: req.files?.pdf?.[0]?.filename
        ? toFileUrl(req, req.files.pdf[0].filename)
        : "",
      isPreview: !!isPreview,
    };

    course.sections.push(sectionData);
    await course.save();

    res.status(200).json({
      message: "Section added",
      course: applyDiscount(course.toObject()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update section (handles either YouTube URL or uploaded file)
export const updateSection = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const { title, videoUrl, isPreview } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const i = Number(index);
    if (!course.sections[i])
      return res.status(400).json({ message: "Invalid section index" });

    if (title) course.sections[i].title = title;
    if (videoUrl && isValidYouTubeUrl(videoUrl)) {
      course.sections[i].videoUrl = videoUrl;
      course.sections[i].videoFile = "";
    }
    if (req.files?.video?.[0]) {
      course.sections[i].videoFile = toFileUrl(req, req.files.video[0].filename);
      course.sections[i].videoUrl = "";
    }
    if (req.files?.pdf?.[0]) {
      course.sections[i].pdf = toFileUrl(req, req.files.pdf[0].filename);
    }
    if (isPreview !== undefined) {
      course.sections[i].isPreview = !!isPreview;
    }

    await course.save();
    res.status(200).json({
      message: "Section updated",
      course: applyDiscount(course.toObject()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Remove section
export const removeSection = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const i = Number(index);
    if (!course.sections[i])
      return res.status(400).json({ message: "Invalid section index" });

    course.sections.splice(i, 1);
    await course.save();

    res.status(200).json({
      message: "Section removed",
      course: applyDiscount(course.toObject()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
