import Profile from "../models/profile.model.js";
import User from "../models/users.model.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

//  upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};


//  Update or create profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // from JWT

    const {
      firstName,
      lastName,
      headline,
      description,
      languages,
      website,
      x,
      linkedin,
      youtube,
      facebook,
    } = req.body;

    // Update User's basic info (only if provided)
    if (firstName || lastName) {
      await User.findByIdAndUpdate(userId, {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      });
    }

    // Find profile
    const existingProfile = await Profile.findOne({ userId });

    // If profile exists and user uploaded a new file → delete old one
    if (existingProfile && existingProfile.profilePicture && req.file) {
      const publicId = existingProfile.profilePictureId;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Upload new profile picture if provided
    let profilePicture, profilePictureId;
    if (req.file) {
      console.log("Uploading profile picture to Cloudinary...");
      const result = await uploadToCloudinary(
        req.file.buffer,
        "profile_pictures"
      );
      profilePicture = result.secure_url;
      profilePictureId = result.public_id; // save public_id for deletion
      console.log("Profile picture uploaded successfully:", profilePicture);
    }

    // Build update object dynamically
    const updateFields = {
      ...(headline && { headline }),
      ...(description && { description }),
      ...(languages && { languages }),
      ...(website && { website }),
      ...(x && { x }),
      ...(linkedin && { linkedin }),
      ...(youtube && { youtube }),
      ...(facebook && { facebook }),
      ...(profilePicture && { profilePicture }),
      ...(profilePictureId && { profilePictureId }),
    };

    // Create or update profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log("Profile updated in DB:", profile.profilePicture);

    res.json({ message: "Profile updated successfully", 
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      description: profile.description || " ",
      headline: profile.headline || " " ,
      profilePicture: profile.profilePicture || " ",
      languages: profile.languages,
      website: profile.website || " ",
      x: profile.x || " ",
      linkedin: profile.linkedin || " ",
      youtube: profile.youtube || " ",
      facebook: profile.facebook || " "
     });
  } catch (err) {
    next(err);
  }
};


// Get profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId }).populate("userId", "firstName lastName email");
    console.log("Fetched profile for user", userId, ":", profile ? profile.profilePicture : "No profile found");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};
