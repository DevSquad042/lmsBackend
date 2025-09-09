import express from "express";
import { getAllInstructors, getInstructorById, getCoursesByInstructorId } from "../controllers/instructor.controller.js";


const instructorsRoute = express.Router();
instructorsRoute.get("/", getAllInstructors);
instructorsRoute.get("/:id", getInstructorById);
instructorsRoute.get("/:id/courses", getCoursesByInstructorId);
export default instructorsRoute;
