import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoFile: {
    type: String, // Uploaded video file name
    default: ''
  },
  videoUrl: {
    type: String, // YouTube link
    default: ''
  },
  pdf: {
    type: String, // Uploaded PDF file name
    default: ''
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  sections: [sectionSchema],
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);
export default Course;
