import Course from "../models/course.model.js";

// validate youtube link
function isValidYouTubeUrl(url) {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
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

// ---------------- CRUD OPERATIONS ----------------

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

    const thumbnail = req.files?.thumbnail?.[0]?.filename || "";

    let parsedSections = [];
    if (sections) {
      parsedSections = JSON.parse(sections).map((section, index) => {
        const videoUrl =
          section.videoUrl && isValidYouTubeUrl(section.videoUrl)
            ? section.videoUrl
            : "";
        const videoFile = req.files?.[`video-${index}`]?.[0]?.filename || "";
        const pdf = req.files?.[`pdf-${index}`]?.[0]?.filename || "";

        return {
          title: section.title,
          videoFile,
          videoUrl,
          pdf,
          isPreview: section.isPreview || false, // NEW 👈
        };
      });
    }

    const newCourse = new Course({
      title,
      description,
      instructor,
      price: price || 0,
      discountPercentage: discountPercentage || 0,
      discountExpiry: discountExpiry || null,
      categories: categories ? categories.split(",").map((c) => c.trim()) : [],
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
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

// ✅ Update course
export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;

    if (req.files?.thumbnail?.[0]) {
      updates.thumbnail = req.files.thumbnail[0].filename;
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

// ✅ Add section
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
      videoFile: req.files?.video?.[0]?.filename || "",
      pdf: req.files?.pdf?.[0]?.filename || "",
      isPreview: isPreview || false, // NEW 👈
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

// ✅ Update section
export const updateSection = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const { title, videoUrl, isPreview } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (title) course.sections[index].title = title;
    if (videoUrl && isValidYouTubeUrl(videoUrl)) {
      course.sections[index].videoUrl = videoUrl;
      course.sections[index].videoFile = "";
    }
    if (req.files?.video?.[0]) {
      course.sections[index].videoFile = req.files.video[0].filename;
      course.sections[index].videoUrl = "";
    }
    if (req.files?.pdf?.[0]) {
      course.sections[index].pdf = req.files.pdf[0].filename;
    }
    if (isPreview !== undefined) {
      course.sections[index].isPreview = isPreview;
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

    course.sections.splice(index, 1);
    await course.save();

    res.status(200).json({
      message: "Section removed",
      course: applyDiscount(course.toObject()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
