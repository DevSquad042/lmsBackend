import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  videoFile: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  pdf: { type: String, default: '' }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  price: { type: Number, default: 0 },

  // 🔥 Discount fields
  discountPercentage: { type: Number, default: 0 }, // e.g. 20 means 20%
  discountExpiry: { type: Date }, // until when the discount is valid

  categories: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  thumbnail: { type: String, default: '' },
  sections: [sectionSchema],
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);
export default Course;
