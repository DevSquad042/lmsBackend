import express from "express";
import { updateProfile, getProfile } from "../controllers/profile.controller.js";
import profileUpload from "../middlewares/multer.js"; 
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const profileRouter = express.Router();

profileRouter.get("/me", verifyToken, getProfile);
profileRouter.put("/update", verifyToken, profileUpload.single("profilePicture"), updateProfile); 

export default profileRouter;
