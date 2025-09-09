import mongoose from 'mongoose';
import Progress from '../models/progress.model.js';
import Enrollment from '../models/enrollment.model.js';
import Course from '../models/course.model.js';

// Save or update video progress
export const saveProgress = async (req, res) => {
  try {
    const { courseId, sectionId, videoId, progress, watchedDuration, totalDuration } = req.body;
    const userId = req.user.id;

    console.log('saveProgress called with:', { userId, courseId, sectionId, videoId, progress, watchedDuration, totalDuration });

    // Validate required fields
    if (!courseId || !sectionId || !videoId || progress === undefined || !totalDuration) {
      return res.status(400).json({ message: 'courseId, sectionId, videoId, progress, and totalDuration are required' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(courseId) ||
        !mongoose.Types.ObjectId.isValid(sectionId) ||
        !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'User is not enrolled in this course' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    // Determine if video is completed (progress >= 90%)
    const completed = progress >= 90;

    // Upsert progress record
    const progressRecord = await Progress.findOneAndUpdate(
      { userId, courseId, sectionId, videoId },
      {
        progress,
        completed,
        watchedDuration: watchedDuration || 0,
        totalDuration,
        lastWatchedAt: new Date()
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Progress saved:', progressRecord);

    res.status(200).json({
      status: 'success',
      data: {
        progress: progressRecord
      }
    });
  } catch (error) {
    console.error('Error in saveProgress:', error);
    res.status(500).json({ message: 'Failed to save progress', error: error.message });
  }
};

// Get progress for a specific course
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    console.log('getCourseProgress called with:', { userId, courseId });

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'User is not enrolled in this course' });
    }

    // Get all progress records for this course
    const progressRecords = await Progress.find({ userId, courseId })
      .sort({ lastWatchedAt: -1 });

    // Calculate overall course progress
    const totalVideos = progressRecords.length;
    const completedVideos = progressRecords.filter(p => p.completed).length;
    const overallProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

    console.log('Course progress:', { totalVideos, completedVideos, overallProgress });

    res.status(200).json({
      status: 'success',
      data: {
        courseId,
        overallProgress: Math.round(overallProgress),
        totalVideos,
        completedVideos,
        progressRecords
      }
    });
  } catch (error) {
    console.error('Error in getCourseProgress:', error);
    res.status(500).json({ message: 'Failed to get course progress', error: error.message });
  }
};

// Get progress for a specific video
export const getVideoProgress = async (req, res) => {
  try {
    const { courseId, sectionId, videoId } = req.params;
    const userId = req.user.id;

    console.log('getVideoProgress called with:', { userId, courseId, sectionId, videoId });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId) ||
        !mongoose.Types.ObjectId.isValid(sectionId) ||
        !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'User is not enrolled in this course' });
    }

    // Get progress for this video
    const progressRecord = await Progress.findOne({ userId, courseId, sectionId, videoId });

    if (!progressRecord) {
      return res.status(200).json({
        status: 'success',
        data: {
          progress: 0,
          completed: false,
          watchedDuration: 0,
          totalDuration: 0,
          lastWatchedAt: null
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        progress: progressRecord.progress,
        completed: progressRecord.completed,
        watchedDuration: progressRecord.watchedDuration,
        totalDuration: progressRecord.totalDuration,
        lastWatchedAt: progressRecord.lastWatchedAt
      }
    });
  } catch (error) {
    console.error('Error in getVideoProgress:', error);
    res.status(500).json({ message: 'Failed to get video progress', error: error.message });
  }
};