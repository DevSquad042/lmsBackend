import express from "express";
import { enrolledCourses } from "../controllers/enrolledCourses.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
const enrolledCoursesRouter = express.Router();

enrolledCoursesRouter.get("/", verifyToken, enrolledCourses)

export default enrolledCoursesRouter;