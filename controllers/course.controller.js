import Course from "../models/course.model.js";

// Helpe to validate YouTube links
function isValidYouTubeUrl(url) {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
}

// Create course
export const createCourse = async (req, res) => {
  try {
    const { title, description, instructor, price, categories, tags, sections } = req.body;

    if (!title || !description || !instructor) {
      return res.status(400).json({ message: 'Title, description, and instructor are required' });
    }

    const exists = await Course.findOne({ title: new RegExp('^' + title + '$', 'i') });
    if (exists) return res.status(409).json({ message: 'Course title already exists' });

    const thumbnail = req.files?.thumbnail?.[0]?.filename || '';

    let parsedSections = [];
    if (sections) {
      parsedSections = JSON.parse(sections).map((section, index) => {
        const videoUrl = section.videoUrl && isValidYouTubeUrl(section.videoUrl) ? section.videoUrl : '';
        const videoFile = req.files?.[`video-${index}`]?.[0]?.filename || '';
        const pdf = req.files?.[`pdf-${index}`]?.[0]?.filename || '';

        return {
          title: section.title,
          videoFile,
          videoUrl,
          pdf
        };
      });
    }

    const newCourse = new Course({
      title,
      description,
      instructor,
      price: price || 0,
      categories: categories ? categories.split(',').map(c => c.trim()) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      thumbnail,
      sections: parsedSections
    });

    const saved = await newCourse.save();
    res.status(201).json({ message: 'Course created', course: saved });

  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve course', error: err.message });
  }
};

// Get course by title
export const getCourseByTitle = async (req, res) => {
  try {
    const title = req.params.title;
    const course = await Course.findOne({
      title: { $regex: new RegExp(`^${title}$`, 'i') }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching course by title', error: err.message });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;

    if (req.file) {
      updates.thumbnail = req.file.filename;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update course', error: err.message });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const deleted = await Course.findByIdAndDelete(courseId);
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete course', error: err.message });
  }
};

// Add section
export const addSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, videoUrl } = req.body;

    if (!title) return res.status(400).json({ message: 'Section title required' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionData = {
      title,
      videoUrl: isValidYouTubeUrl(videoUrl) ? videoUrl : '',
      videoFile: req.files?.video?.[0]?.filename || '',
      pdf: req.files?.pdf?.[0]?.filename || ''
    };

    course.sections.push(sectionData);
    await course.save();

    res.status(200).json({ message: 'Section added', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update section
export const updateSection = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const { title, videoUrl } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (title) course.sections[index].title = title;
    if (videoUrl && isValidYouTubeUrl(videoUrl)) {
      course.sections[index].videoUrl = videoUrl;
      course.sections[index].videoFile = '';
    }
    if (req.files?.video?.[0]) {
      course.sections[index].videoFile = req.files.video[0].filename;
      course.sections[index].videoUrl = '';
    }
    if (req.files?.pdf?.[0]) {
      course.sections[index].pdf = req.files.pdf[0].filename;
    }

    await course.save();
    res.status(200).json({ message: 'Section updated', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove section
export const removeSection = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.sections.splice(index, 1);
    await course.save();

    res.status(200).json({ message: 'Section removed', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
