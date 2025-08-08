const Course = require('../models/course.model.js');

// Create course with optional sections + videos
exports.createCourse = async (req, res) => {
  try {
    const { title, description, instructor, price, categories, tags, sections } = req.body;

    if (!title || !description || !instructor) {
      return res.status(400).json({ message: 'Title, description, and instructor are required' });
    }

    const exists = await Course.findOne({ title: new RegExp('^' + title + '$', 'i') });
    if (exists) return res.status(409).json({ message: 'Course title already exists' });

    const thumbnail = req.files?.thumbnail?.[0]?.filename || '';

    // Parse sections if provided (JSON string from frontend)
    let parsedSections = [];
    if (sections) {
      parsedSections = JSON.parse(sections).map((section, index) => ({
        title: section.title,
        video: req.files?.[`video-${index}`]?.[0]?.filename || ''
      }));
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

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve course', error: err.message });
  }
};

exports.getCourseByTitle = async (req, res) => {
  try {
    const title = req.params.title;
    const course = await Course.findOne({
      title: { $regex: new RegExp(`^${title}$`, 'i') } // case-insensitive exact match
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching course by title', error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;

    // Handle optional thumbnail update
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

exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const deleted = await Course.findByIdAndDelete(courseId);
    if (!deleted) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete course', error: err.message });
  }
};

// Add a new section to a course
exports.addSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;
    const video = req.file?.filename || '';

    if (!title) return res.status(400).json({ message: 'Section title required' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.sections.push({ title, video });
    await course.save();

    res.status(200).json({ message: 'Section added', course });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove a section by index
exports.removeSection = async (req, res) => {
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

// Update a section (title or video)
exports.updateSection = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const { title } = req.body;
    const video = req.file?.filename;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (title) course.sections[index].title = title;
    if (video) course.sections[index].video = video;

    await course.save();
    res.status(200).json({ message: 'Section updated', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const mongoose = require('mongoose');