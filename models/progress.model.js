import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  progress: {
    type: Number, // Percentage 0-100
    required: true,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  watchedDuration: {
    type: Number, // Seconds watched
    default: 0
  },
  totalDuration: {
    type: Number, // Total video duration in seconds
    required: true
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user-video
progressSchema.index({ userId: 1, courseId: 1, sectionId: 1, videoId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);