// models/profile.model.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true, 
    unique: true 
  },
  headline: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  languages: {
    type: [String], // allow multiple languages
    enum: ["english", "chinese", "spanish", "german"],
    default: ["english"]
  },
  profilePicture: {
    type: String // Cloudinary URL
  },
  profilePictureId: {
    type: String // Cloudinary public_id for deletion
  },
  website: { type: String },
  x: { type: String },        // Twitter / X
  linkedin: { type: String },
  youtube: { type: String },
  facebook: { type: String }
}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);
