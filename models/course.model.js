import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  video: {
    type: String, // Store file name or URL
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

  url:{
    type: String,
  
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
  sections: [sectionSchema], // 👈 Optional array of sections with video
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);
export default Course;
